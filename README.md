# CuraWise

AI-Based Symptom Checker and Hospital Recommendation System.

## Structure
- frontend/ (Next.js + Tailwind)
- backend/ (Django + DRF)
- ml/ (scikit-learn model placeholder)
- blockchain/ (Solidity contract placeholder)

## Quick Start (Local)
1) Backend
- Create venv and install deps from `backend/requirements.txt`
- Create `.env` from `.env.example`
- Run migrations and start server
- (Optional) Seed demo users and hospitals

2) Frontend
- Install deps from `frontend/package.json`
- Run `npm run dev`

## Notes
- The AI model is a stub in `ml/symptom_model.py`.
- The blockchain contract is a stub in `blockchain/MedicalRecords.sol`.

## Demo Users (after seeding)
- admin / admin123 (Admin)
- dr_arjun / doctor123 (Doctor)
- user_aisha / user123 (User)

### Seed Command
```
python manage.py shell -c "from api.seed import run; run()"
```

### Doctor Approval
New doctor accounts require admin approval before they can consult.
