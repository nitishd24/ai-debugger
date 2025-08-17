# 🤖 AI Debugging Assistant - Google Gemini Version

## 🚀 Quick Setup (3 Minutes)

### Step 1: Get Free Google AI API Key
1. Go to **[ai.google.dev](https://ai.google.dev)**
2. Click **"Get API Key"** 
3. Sign in with Google account
4. Create new project or use existing
5. **Copy your API key** (free tier: 1500 requests/day)

### Step 2: Install Requirements
```bash
pip install google-generativeai pandas
```

### Step 3: Save the Script
Save this as `gemini_debugger.py`:

```python
# AI Debugging Assistant - Google Gemini Version
import pandas as pd
import time
from datetime import datetime

class GeminiAIDebugger:
    def __init__(self, api_key):
        try:
            import google.generativeai as genai
            self.genai = genai
            self.genai.configure(api_key=api_key)
            self.model = self.genai.GenerativeModel('gemini-pro')
            print("✅ Gemini AI initialized successfully!")
        except ImportError:
            print("❌ Error: google-generativeai not installed.")
            print("📦 Install with: pip install google-generativeai")
            raise

    def load_kibana_logs(self, file_path):
        """Load CSV/JSON exported from Kibana"""
        if file_path.endswith('.csv'):
            return pd.read_csv(file_path)
        elif file_path.endswith('.json'):
            return pd.read_json(file_path)

    def preprocess_logs(self, df):
        """Clean and prepare logs for analysis"""
        # Find relevant columns automatically
        timestamp_cols = [col for col in df.columns if 'time' in col.lower()]
        level_cols = [col for col in df.columns if 'level' in col.lower()]
        message_cols = [col for col in df.columns if any(x in col.lower() for x in ['message', 'msg', 'text'])]
        
        essential_cols = []
        if timestamp_cols: essential_cols.extend(timestamp_cols[:1])
        if level_cols: essential_cols.extend(level_cols[:1])
        if message_cols: essential_cols.extend(message_cols[:1])
        
        if not essential_cols:
            essential_cols = df.columns[:3].tolist()
        
        cleaned_df = df[essential_cols].drop_duplicates()
        
        # Filter for errors if level column exists
        if level_cols and level_cols[0] in cleaned_df.columns:
            level_col = level_cols[0]
            cleaned_df = cleaned_df[
                cleaned_df[level_col].astype(str).str.upper().str.contains(
                    'ERROR|WARN|EXCEPTION|FATAL|CRITICAL', na=False
                )
            ]
        
        return cleaned_df.head(50)  # Limit for API efficiency

    def analyze_chunk(self, log_chunk, chunk_num):
        """Analyze logs with Gemini"""
        prompt = f"""
You are an expert DevOps engineer. Analyze these production error logs:

{log_chunk}

Provide:
1. **Root Cause**: Primary issue
2. **Affected Component**: Which service/system  
3. **Severity**: Critical/High/Medium/Low
4. **Immediate Action**: What to do now
5. **Long-term Fix**: Prevention strategy

Be specific and actionable.
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text if hasattr(response, 'text') else "Analysis failed"
        except Exception as e:
            return f"Error: {str(e)}"

    def generate_report(self, file_path):
        """Generate complete incident report"""
        print("🚀 Starting analysis...")
        
        df = self.load_kibana_logs(file_path)
        cleaned_df = self.preprocess_logs(df)
        
        if len(cleaned_df) == 0:
            return "No error logs found"
        
        # Chunk logs (Gemini handles longer inputs better than HF)
        chunks = []
        chunk_size = 3000
        current_chunk = ""
        
        for _, row in cleaned_df.iterrows():
            row_text = " | ".join([f"{col}: {val}" for col, val in row.items()]) + "\n"
            if len(current_chunk + row_text) > chunk_size:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = row_text
            else:
                current_chunk += row_text
        
        if current_chunk:
            chunks.append(current_chunk)
        
        # Analyze with rate limiting
        analyses = []
        for i, chunk in enumerate(chunks[:3]):  # Max 3 chunks for free tier
            print(f"🤖 Analyzing segment {i+1}...")
            analysis = self.analyze_chunk(chunk, i+1)
            analyses.append(analysis)
            if i < len(chunks) - 1:
                time.sleep(4)  # Rate limiting: 15 req/min
        
        # Generate report
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        report = f"""# 🚨 AI Incident Report - Gemini Analysis

**Generated:** {timestamp}
**Source:** {file_path}  
**Logs Analyzed:** {len(cleaned_df)}

## 📋 Executive Summary
Automated analysis of production error logs using Google Gemini Pro.

## 🔍 Detailed Analysis

"""
        
        for i, analysis in enumerate(analyses, 1):
            report += f"### Segment {i} Analysis\n{analysis}\n\n---\n\n"
        
        report += """## 🎯 Recommended Actions

### Immediate (Next 30 min)
- Monitor system health dashboards
- Verify critical service status  
- Check database connectivity
- Review recent deployments

### Short-term (Next 24 hours)
- Implement fixes from analysis above
- Add monitoring for detected patterns
- Update incident runbooks
- Notify stakeholders of status

### Long-term (Next sprint)
- Improve error handling in affected services
- Add automated alerts for similar patterns
- Review architecture for resilience
- Enhance testing coverage

---
*Generated by AI Debugging Assistant v2.0 (Gemini)*
"""
        
        return report

# Usage example
if __name__ == "__main__":
    # Initialize with your free API key
    debugger = GeminiAIDebugger("YOUR_GEMINI_API_KEY_HERE")
    
    # Generate report from Kibana export
    report = debugger.generate_report("your_kibana_logs.csv")
    
    # Save report
    filename = f"incident_report_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
    with open(filename, "w") as f:
        f.write(report)
    
    print(f"✅ Report saved to {filename}")
```

## 🔧 Usage

### Basic Usage
```bash
python gemini_debugger.py
```

### Advanced Usage

```python
from ai_debugger.debugger_providers.gemini_debugger import GeminiAIDebugger

debugger = GeminiAIDebugger("your_api_key_here")
report = debugger.generate_report("kibana_export.csv")
print(report)
```

## 📊 Gemini Advantages

### Why Gemini is Great for Log Analysis:
✅ **Longer Context Window** - Handles more logs per request  
✅ **Better Reasoning** - Superior at identifying root causes  
✅ **Structured Output** - Consistent report formatting  
✅ **Free Tier Generous** - 1500 requests/day  
✅ **Fast Processing** - Quick analysis turnaround  

### Performance Specs:
- **Processing Speed**: 3-5 seconds per log chunk
- **Context Window**: ~30K tokens (much more than HF free tier)
- **Daily Limit**: 1500 requests (enough for 50+ incident analyses)
- **Quality**: Production-grade analysis suitable for incident reports

## 🛠️ Customization

### For Different Log Sources:
- **Kubernetes**: Works with kubectl logs exports
- **AWS CloudWatch**: Compatible with log exports  
- **Application Logs**: Any JSON/CSV format
- **Web Servers**: Nginx, Apache access/error logs

### Modify for Your Stack:
```python
# Add custom preprocessing for your log format
def custom_preprocess(self, df):
    # Your specific log parsing logic
    if 'kubernetes' in df.columns:
        # Handle K8s logs
        pass
    elif 'cloudwatch' in df.columns:
        # Handle CloudWatch logs  
        pass
```

## 🚨 Rate Limits & Best Practices

### Free Tier Limits:
- **15 requests per minute**
- **1500 requests per day** 
- **30K tokens per request**

### Optimization Tips:
1. **Pre-filter logs** in Kibana (level:error) before export
2. **Use time windows** during incidents (15-30 min)
3. **Batch multiple incidents** in one analysis session
4. **Cache common patterns** to avoid re-analysis

## 🔗 Integration Ideas

### Phase 2 Enhancements:
```python
# Slack integration
def post_to_slack(report):
    # Auto-post reports to incident channels
    pass

# Monitoring integration  
def trigger_on_error_spike():
    # Auto-run analysis when error rates spike
    pass

# Knowledge base
def save_to_kb(incident_report):
    # Build database of solved incidents
    pass
```

## 💡 Pro Tips

1. **Export Strategy**: Filter logs by error level before export to reduce noise
2. **Time Windows**: Use 15-30 minute windows around incident time
3. **Multiple Services**: Run separate analyses per service for focused insights
4. **Report Sharing**: Save reports as markdown for easy sharing in Slack/Teams

---

**Ready to eliminate 3 AM debugging sessions?** 🌙 → ☀️

Your AI debugging assistant is ready to go!