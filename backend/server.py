from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 72

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    username: str
    level: int = 1
    xp: int = 0
    streak: int = 0
    last_activity: Optional[str] = None
    total_study_time: int = 0
    achievements: List[str] = []
    avatar_index: int = 0

class UserStats(BaseModel):
    level: int
    xp: int
    xp_for_next_level: int
    streak: int
    total_study_time: int
    achievements_count: int

class HabitCreate(BaseModel):
    name: str
    category: str
    color: str
    frequency: str = "daily"

class Habit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    category: str
    color: str
    frequency: str
    completed_today: bool = False
    streak: int = 0
    last_completed: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    category: str
    xp_reward: int = 10

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    title: str
    category: str
    completed: bool = False
    xp_reward: int
    created_at: str

class StudySessionStart(BaseModel):
    category: str

class StudySessionComplete(BaseModel):
    session_id: str
    duration: int

class StudySession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    category: str
    duration: int
    xp_gained: int
    started_at: str
    completed_at: Optional[str] = None

class Achievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    icon: str
    xp_reward: int

class UserAchievement(BaseModel):
    achievement: Achievement
    unlocked: bool
    unlocked_at: Optional[str] = None

class Challenge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    type: str
    title: str
    description: str
    xp_reward: int
    target: int
    progress: int = 0
    expires_at: str

class LeaderboardEntry(BaseModel):
    user_id: str
    username: str
    level: int
    xp: int
    avatar_index: int
    is_bot: bool = False

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    return decode_token(token)

# ============ HELPER FUNCTIONS ============

def calculate_level(xp: int) -> int:
    return int((xp / 100) ** 0.5) + 1

def xp_for_level(level: int) -> int:
    return ((level - 1) ** 2) * 100

def generate_bots(count: int = 10) -> List[LeaderboardEntry]:
    bot_names = [
        "CodeMaster", "StudyNinja", "FocusWarrior", "BrainBooster", "TaskHunter",
        "ProductivityKing", "LearnLegend", "HabitHero", "XPSeeker", "MindMaster",
        "FlowState", "GrindMachine", "LevelUpLord", "QuestQueen", "SkillSurge"
    ]
    bots = []
    for i in range(count):
        xp = random.randint(500, 5000)
        level = calculate_level(xp)
        bots.append(LeaderboardEntry(
            user_id=f"bot_{i}",
            username=random.choice(bot_names),
            level=level,
            xp=xp,
            avatar_index=random.randint(0, 2),
            is_bot=True
        ))
    return bots

async def check_and_award_achievements(user_id: str, user_data: dict):
    achievements_data = [
        {"id": "first_study", "name": "Primeira Sessão", "description": "Complete sua primeira sessão de estudo", "icon": "BookOpen", "xp_reward": 50, "condition": lambda u: u['total_study_time'] > 0},
        {"id": "study_1h", "name": "1 Hora de Foco", "description": "Estude por 1 hora", "icon": "Clock", "xp_reward": 100, "condition": lambda u: u['total_study_time'] >= 3600},
        {"id": "level_5", "name": "Nível 5", "description": "Alcance o nível 5", "icon": "Award", "xp_reward": 200, "condition": lambda u: u['level'] >= 5},
        {"id": "streak_7", "name": "Semana de Fogo", "description": "Mantenha uma sequência de 7 dias", "icon": "Flame", "xp_reward": 300, "condition": lambda u: u['streak'] >= 7},
    ]
    
    new_achievements = []
    for ach in achievements_data:
        if ach['id'] not in user_data.get('achievements', []):
            if ach['condition'](user_data):
                new_achievements.append(ach['id'])
                await db.users.update_one(
                    {"id": user_id},
                    {"$push": {"achievements": ach['id']}, "$inc": {"xp": ach['xp_reward']}}
                )
    return new_achievements

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "username": user_data.username,
        "password_hash": hash_password(user_data.password),
        "level": 1,
        "xp": 0,
        "streak": 0,
        "last_activity": None,
        "total_study_time": 0,
        "achievements": [],
        "avatar_index": random.randint(0, 2),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    token = create_token(user_id)
    
    return {"token": token, "user": User(**user)}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = create_token(user['id'])
    return {"token": token, "user": User(**user)}

@api_router.get("/auth/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return User(**user)

# ============ USER STATS ============

@api_router.get("/user/stats", response_model=UserStats)
async def get_user_stats(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    level = user['level']
    xp = user['xp']
    next_level_xp = xp_for_level(level + 1)
    
    return UserStats(
        level=level,
        xp=xp,
        xp_for_next_level=next_level_xp,
        streak=user['streak'],
        total_study_time=user['total_study_time'],
        achievements_count=len(user.get('achievements', []))
    )

@api_router.post("/user/add-xp")
async def add_xp(amount: int, user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    new_xp = user['xp'] + amount
    new_level = calculate_level(new_xp)
    leveled_up = new_level > user['level']
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"xp": new_xp, "level": new_level}}
    )
    
    return {"xp": new_xp, "level": new_level, "leveled_up": leveled_up}

# ============ LEADERBOARD ============

@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(user_id: str = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "id": 1, "username": 1, "level": 1, "xp": 1, "avatar_index": 1}).to_list(100)
    
    leaderboard = [LeaderboardEntry(
        user_id=u['id'],
        username=u['username'],
        level=u['level'],
        xp=u['xp'],
        avatar_index=u.get('avatar_index', 0),
        is_bot=False
    ) for u in users]
    
    bots = generate_bots(10)
    leaderboard.extend(bots)
    leaderboard.sort(key=lambda x: x.xp, reverse=True)
    
    return leaderboard[:20]

# ============ HABITS ============

@api_router.post("/habits", response_model=Habit)
async def create_habit(habit_data: HabitCreate, user_id: str = Depends(get_current_user)):
    habit_id = str(uuid.uuid4())
    habit = {
        "id": habit_id,
        "user_id": user_id,
        "name": habit_data.name,
        "category": habit_data.category,
        "color": habit_data.color,
        "frequency": habit_data.frequency,
        "completed_today": False,
        "streak": 0,
        "last_completed": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.habits.insert_one(habit)
    return Habit(**habit)

@api_router.get("/habits", response_model=List[Habit])
async def get_habits(user_id: str = Depends(get_current_user)):
    habits = await db.habits.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return [Habit(**h) for h in habits]

@api_router.post("/habits/{habit_id}/complete")
async def complete_habit(habit_id: str, user_id: str = Depends(get_current_user)):
    habit = await db.habits.find_one({"id": habit_id, "user_id": user_id}, {"_id": 0})
    if not habit:
        raise HTTPException(status_code=404, detail="Hábito não encontrado")
    
    xp_reward = 20
    await db.habits.update_one(
        {"id": habit_id},
        {"$set": {"completed_today": True, "last_completed": datetime.now(timezone.utc).isoformat()}, "$inc": {"streak": 1}}
    )
    await db.users.update_one({"id": user_id}, {"$inc": {"xp": xp_reward}})
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    new_level = calculate_level(user['xp'])
    await db.users.update_one({"id": user_id}, {"$set": {"level": new_level}})
    
    return {"xp_gained": xp_reward, "new_xp": user['xp'], "level": new_level}

@api_router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str, user_id: str = Depends(get_current_user)):
    result = await db.habits.delete_one({"id": habit_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Hábito não encontrado")
    return {"message": "Hábito deletado"}

# ============ TASKS ============

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, user_id: str = Depends(get_current_user)):
    task_id = str(uuid.uuid4())
    task = {
        "id": task_id,
        "user_id": user_id,
        "title": task_data.title,
        "category": task_data.category,
        "completed": False,
        "xp_reward": task_data.xp_reward,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tasks.insert_one(task)
    return Task(**task)

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(user_id: str = Depends(get_current_user)):
    tasks = await db.tasks.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return [Task(**t) for t in tasks]

@api_router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str, user_id: str = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id, "user_id": user_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    await db.tasks.update_one({"id": task_id}, {"$set": {"completed": True}})
    await db.users.update_one({"id": user_id}, {"$inc": {"xp": task['xp_reward']}})
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    new_level = calculate_level(user['xp'])
    await db.users.update_one({"id": user_id}, {"$set": {"level": new_level}})
    
    return {"xp_gained": task['xp_reward'], "new_xp": user['xp'], "level": new_level}

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user_id: str = Depends(get_current_user)):
    result = await db.tasks.delete_one({"id": task_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return {"message": "Tarefa deletada"}

# ============ STUDY SESSIONS ============

@api_router.post("/study/start")
async def start_study_session(session_data: StudySessionStart, user_id: str = Depends(get_current_user)):
    session_id = str(uuid.uuid4())
    session = {
        "id": session_id,
        "user_id": user_id,
        "category": session_data.category,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "duration": 0,
        "xp_gained": 0,
        "completed_at": None
    }
    await db.study_sessions.insert_one(session)
    return {"session_id": session_id, "started_at": session['started_at']}

@api_router.post("/study/complete")
async def complete_study_session(session_data: StudySessionComplete, user_id: str = Depends(get_current_user)):
    session = await db.study_sessions.find_one({"id": session_data.session_id, "user_id": user_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    duration = session_data.duration
    xp_gained = max(10, duration // 60)
    
    await db.study_sessions.update_one(
        {"id": session_data.session_id},
        {"$set": {"duration": duration, "xp_gained": xp_gained, "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"xp": xp_gained, "total_study_time": duration}}
    )
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    new_level = calculate_level(user['xp'])
    await db.users.update_one({"id": user_id}, {"$set": {"level": new_level}})
    
    await check_and_award_achievements(user_id, user)
    
    return {"xp_gained": xp_gained, "duration": duration, "new_xp": user['xp'], "level": new_level}

@api_router.get("/study/stats")
async def get_study_stats(user_id: str = Depends(get_current_user)):
    sessions = await db.study_sessions.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    total_sessions = len(sessions)
    total_time = sum(s.get('duration', 0) for s in sessions)
    avg_session = total_time // total_sessions if total_sessions > 0 else 0
    
    return {
        "total_sessions": total_sessions,
        "total_time": total_time,
        "average_session": avg_session
    }

# ============ ACHIEVEMENTS ============

@api_router.get("/achievements", response_model=List[UserAchievement])
async def get_achievements(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    all_achievements = [
        Achievement(id="first_study", name="Primeira Sessão", description="Complete sua primeira sessão de estudo", icon="BookOpen", xp_reward=50),
        Achievement(id="study_1h", name="1 Hora de Foco", description="Estude por 1 hora", icon="Clock", xp_reward=100),
        Achievement(id="level_5", name="Nível 5", description="Alcance o nível 5", icon="Award", xp_reward=200),
        Achievement(id="streak_7", name="Semana de Fogo", description="Mantenha uma sequência de 7 dias", icon="Flame", xp_reward=300),
    ]
    
    user_achievements = user.get('achievements', [])
    result = []
    for ach in all_achievements:
        unlocked = ach.id in user_achievements
        result.append(UserAchievement(
            achievement=ach,
            unlocked=unlocked,
            unlocked_at=None
        ))
    
    return result

# ============ CHALLENGES ============

@api_router.get("/challenges", response_model=List[Challenge])
async def get_challenges(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    today = datetime.now(timezone.utc).date()
    end_of_day = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)
    end_of_week = (datetime.now(timezone.utc) + timedelta(days=(6 - datetime.now(timezone.utc).weekday()))).replace(hour=23, minute=59, second=59)
    
    sessions_today = await db.study_sessions.count_documents({
        "user_id": user_id,
        "started_at": {"$gte": datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc).isoformat()}
    })
    
    total_time_today = 0
    sessions = await db.study_sessions.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    for s in sessions:
        if s.get('started_at', '').startswith(today.isoformat()):
            total_time_today += s.get('duration', 0)
    
    challenges = [
        Challenge(
            id="daily_study",
            type="daily",
            title="Desafio Diário: 30min",
            description="Estude por 30 minutos hoje",
            xp_reward=50,
            target=1800,
            progress=min(total_time_today, 1800),
            expires_at=end_of_day.isoformat()
        ),
        Challenge(
            id="daily_3_sessions",
            type="daily",
            title="3 Sessões Hoje",
            description="Complete 3 sessões de estudo",
            xp_reward=75,
            target=3,
            progress=min(sessions_today, 3),
            expires_at=end_of_day.isoformat()
        ),
        Challenge(
            id="weekly_10h",
            type="weekly",
            title="Desafio Semanal: 10h",
            description="Acumule 10 horas de estudo",
            xp_reward=500,
            target=36000,
            progress=min(user['total_study_time'], 36000),
            expires_at=end_of_week.isoformat()
        )
    ]
    
    return challenges

# ============ ROOT ============

@api_router.get("/")
async def root():
    return {"message": "LevelUp API - Gamified Productivity"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()