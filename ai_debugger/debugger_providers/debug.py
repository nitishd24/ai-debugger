from ai_debugger import settings
from ai_debugger.debugger_providers.gemini_debugger import GeminiAIDebugger

debugger = GeminiAIDebugger(settings.GEMINI_API_KEY)
report = debugger.generate_report("logs.csv")

with open("incident_report.md", "w") as f:
    f.write(report)
