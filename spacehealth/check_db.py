# check_db.py
import sqlite3
from tabulate import tabulate  # for pretty tables (pip install tabulate)

DB_PATH = "db.sqlite3"

def show_health_logs():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM health_healthlog ORDER BY timestamp DESC LIMIT 10;")
    rows = cur.fetchall()
    conn.close()

    if not rows:
        print("⚠️ No Health Logs found.")
        return

    headers = ["id", "timestamp", "heart_rate", "oxygen_level", "sleep_hours", "stress_level", "prediction"]
    print("\n📊 Latest Health Logs:")
    print(tabulate(rows, headers=headers, tablefmt="grid"))

def show_chat_logs():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM health_chatlog ORDER BY timestamp DESC LIMIT 10;")
    rows = cur.fetchall()
    conn.close()

    if not rows:
        print("⚠️ No Chat Logs found.")
        return

    headers = ["id", "timestamp", "user_message", "bot_reply"]
    print("\n💬 Latest Chat Logs:")
    print(tabulate(rows, headers=headers, tablefmt="grid"))

if __name__ == "__main__":
    print("=== AstroBuddy DB Inspector ===")
    show_health_logs()
    show_chat_logs()
