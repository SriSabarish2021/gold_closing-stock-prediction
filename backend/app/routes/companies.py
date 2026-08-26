from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.yahoo_finance import get_supported_companies
from app.schemas.predict_schema import CompanyItem

router = APIRouter(prefix="/api/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyItem])
def list_companies(search: Optional[str] = Query(None, description="Search term for symbol or company name")):
    companies = get_supported_companies(search)
    return [CompanyItem(**c) for c in companies]
