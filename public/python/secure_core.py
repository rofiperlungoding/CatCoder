from datetime import datetime, timedelta
import json

# Requirements: 1.1, 1.2, 2.1 (from Design Doc)
# This module acts as the Single Source of Truth for CatCoder.

class SecureState:
    def __init__(self):
        self._state = {
            "xp": 0,
            "level": 1,
            "session_id": "",
            "device_pub_key": "",
            "last_activity": datetime.now().isoformat(),
            "monotonic_activity": 0.0,
            "is_locked": False
        }
        self.IDLE_TIMEOUT_SECONDS = 15 * 60 # 15 Minutes

    def set_identity(self, pub_key: str):
        """Blueprint Requirement: Identity Protection"""
        self._state["device_pub_key"] = pub_key
        print(f"Engine Identity Set: {pub_key[:10]}...")

    def get_state(self):
        return self._state.copy()

    def update_xp(self, amount: int, now_ms: float):
        if self._state["is_locked"]:
            return self.get_state()
            
        # Mathematical integrity: XP cannot be negative
        if amount > 0:
            self._state["xp"] += amount
            self._state["level"] = self._calculate_level(self._state["xp"])
            self._update_activity(now_ms)
        
        return self.get_state()

    def _calculate_level(self, xp: int) -> int:
        import math
        return int(math.sqrt(xp / 100)) + 1

    def _update_activity(self, now_ms: float):
        """Blueprint Requirement: Monotonic Tracking. 
        Uses performance.now() from JS to prevent clock skew attacks."""
        self._state["last_activity"] = datetime.now().isoformat()
        self._state["monotonic_activity"] = now_ms / 1000.0 # Convert to seconds

    def check_idle(self, now_ms: float) -> bool:
        """Blueprint Requirement: Brutal Session Timeout (15m)"""
        if self._state["is_locked"]:
            return True
            
        now_sec = now_ms / 1000.0
        elapsed = now_sec - self._state["monotonic_activity"]
        
        if elapsed > self.IDLE_TIMEOUT_SECONDS:
            print(f"[SecureCore] Brutal Timeout: {elapsed:.1f}s inactivity detected.")
            self.scrub_memory()
            return True
        return False

    def scrub_memory(self):
        """Blueprint Requirement: Scrub and Destroy memory on idle or logout"""
        self._state = {
            "xp": 0,
            "level": 0,
            "session_id": "EXPIRED",
            "last_activity": "",
            "is_locked": True
        }
        # In a real C environment, we'd zero-fill the bytearray.
        # In Python/Wasm, we trust the garbage collector after resetting the dict.

    def dispatch(self, action: str, params: dict):
        """Strict Action Dispatcher"""
        try:
            if action == "UPDATE_XP":
                return self.update_xp(params.get("amount", 0), params.get("now", 0))
            elif action == "IDENTITY_SETUP":
                self.set_identity(params.get("pub_key", ""))
                self._update_activity(params.get("now", 0))
                return self.get_state()
            elif action == "HEARTBEAT":
                self.check_idle(params.get("now", 0))
                return self.get_state()
            elif action == "CHECK_IDLE":
                return self.get_state() if not self.check_idle(params.get("now", 0)) else self.get_state()
            elif action == "SCRUB":
                self.scrub_memory()
                return self.get_state()
            else:
                return {"error": "Unknown Action"}
        except Exception as e:
            return {"error": str(e)}

# Global Engine Instance
engine = SecureState()

def dispatch(action_json: str):
    """Entry point for TypeScript bridge"""
    import json
    try:
        data = json.loads(action_json)
        action = data.get("type")
        params = data.get("payload", {})
        result = engine.dispatch(action, params)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

print("Secure Core Initialized")
