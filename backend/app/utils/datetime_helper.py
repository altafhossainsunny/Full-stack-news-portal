from datetime import datetime, timezone


def utcnow():
    return datetime.now(timezone.utc)


def format_iso(dt) -> str:
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    return dt.isoformat()


def serialize_doc(doc: dict) -> dict:
    """Convert a MongoDB document to JSON-serializable format."""
    if doc is None:
        return None
    from bson import ObjectId
    serialized = {}
    for k, v in doc.items():
        if k == "_id":
            serialized["id"] = str(v)
        elif isinstance(v, ObjectId):
            serialized[k] = str(v)
        elif isinstance(v, datetime):
            serialized[k] = format_iso(v)
        elif isinstance(v, list):
            serialized[k] = [
                str(i) if isinstance(i, ObjectId) else
                format_iso(i) if isinstance(i, datetime) else i
                for i in v
            ]
        else:
            serialized[k] = v
    return serialized


def serialize_list(docs: list) -> list:
    return [serialize_doc(d) for d in docs]
