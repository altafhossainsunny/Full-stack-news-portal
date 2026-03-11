from flask import jsonify


def success(data=None, message="Success", status=200):
    payload = {"message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status


def error(message="An error occurred", status=400, errors=None):
    payload = {"error": message}
    if errors:
        payload["errors"] = errors
    return jsonify(payload), status


def paginated(items, total, page, per_page):
    return jsonify({
        "data": items,
        "pagination": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        }
    }), 200
