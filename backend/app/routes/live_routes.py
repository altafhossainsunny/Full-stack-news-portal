from flask import Blueprint
from ..controllers.live_controller import (
    start_stream, end_stream, get_active_stream, list_streams,
    add_live_update, get_live_updates
)

live_bp = Blueprint("live", __name__)

live_bp.post("/streams")(start_stream)
live_bp.post("/streams/<stream_id>/end")(end_stream)
live_bp.get("/streams/active")(get_active_stream)
live_bp.get("/streams")(list_streams)
live_bp.post("/updates")(add_live_update)
live_bp.get("/updates")(get_live_updates)
