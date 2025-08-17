# AI Debugging Assistant - Google Gemini Version
# Using Google Gemini API (1500 requests/day free)

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
        except Exception as e:
            print(f"❌ Error initializing Gemini: {str(e)}")
            raise

    def load_kibana_logs(self, file_path):
        """Load CSV/JSON exported from Kibana"""
        try:
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
                print(f"📊 Loaded {len(df)} records from CSV")
                return df
            elif file_path.endswith('.json'):
                df = pd.read_json(file_path)
                print(f"📊 Loaded {len(df)} records from JSON")
                return df
            else:
                print("❌ Unsupported file format. Use .csv or .json")
                return None
        except Exception as e:
            print(f"❌ Error loading file: {str(e)}")
            return None

    def preprocess_logs(self, df):
        """Clean and prepare logs for analysis"""
        if df is None or len(df) == 0:
            return pd.DataFrame()

        print("🧹 Preprocessing logs...")

        possible_timestamp_cols = [col for col in df.columns if 'time' in col.lower() or 'date' in col.lower()]
        possible_level_cols = [col for col in df.columns if 'level' in col.lower() or 'severity' in col.lower()]
        possible_message_cols = [col for col in df.columns if
                                 'message' in col.lower() or 'msg' in col.lower() or 'text' in col.lower()]
        possible_service_cols = [col for col in df.columns if 'service' in col.lower() or 'app' in col.lower()]

        essential_cols = []
        if possible_timestamp_cols:
            essential_cols.extend(possible_timestamp_cols[:1])
        if possible_level_cols:
            essential_cols.extend(possible_level_cols[:1])
        if possible_message_cols:
            essential_cols.extend(possible_message_cols[:1])
        if possible_service_cols:
            essential_cols.extend(possible_service_cols[:1])

        if not essential_cols:
            essential_cols = df.columns[:4].tolist()

        essential_cols = list(dict.fromkeys(essential_cols))
        print(f"📋 Using columns: {essential_cols}")

        available_cols = [col for col in essential_cols if col in df.columns]
        cleaned_df = df[available_cols].copy()
        cleaned_df = cleaned_df.drop_duplicates()

        if possible_level_cols and possible_level_cols[0] in cleaned_df.columns:
            level_col = possible_level_cols[0]
            error_df = cleaned_df[
                cleaned_df[level_col].astype(str).str.upper().str.contains(
                    'ERROR|WARN|EXCEPTION|FATAL|CRITICAL', na=False
                )
            ]
            if len(error_df) > 0:
                cleaned_df = error_df
                print(f"🎯 Filtered to {len(cleaned_df)} error/warning entries")

        if len(cleaned_df) > 100:
            cleaned_df = cleaned_df.head(100)
            print(f"⚡ Limited to top 100 entries for analysis")

        return cleaned_df

    def chunk_logs(self, df, max_chars=2000):
        """Split logs into chunks to avoid token limits"""
        if len(df) == 0:
            return []

        chunks = []
        current_chunk = ""

        for _, row in df.iterrows():
            row_text = " | ".join([f"{col}: {val}" for col, val in row.items()]) + "\n"

            if len(current_chunk + row_text) > max_chars:
                if current_chunk:
                    chunks.append(current_chunk)
                    current_chunk = row_text
                else:
                    chunks.append(row_text[:max_chars])
            else:
                current_chunk += row_text

        if current_chunk:
            chunks.append(current_chunk)

        print(f"📦 Split logs into {len(chunks)} chunks for analysis")
        return chunks

    def analyze_chunk(self, log_chunk, chunk_num):
        """Send chunk to Gemini API for analysis"""
        prompt = f"""
You are an expert DevOps engineer analyzing production error logs. Please analyze the following logs and provide:

1. **Root Cause**
2. **Affected Component**
3. **Severity** (Critical/High/Medium/Low)
4. **Immediate Action**
5. **Long-term Fix**

Error Logs:
{log_chunk}
"""

        try:
            print(f"🤖 Analyzing chunk {chunk_num} with Gemini...")
            response = self.model.generate_content(prompt)

            if hasattr(response, 'text') and response.text:
                return response.text
            else:
                return "Analysis could not be generated for this chunk."

        except Exception as e:
            print(f"⚠️ API Error for chunk {chunk_num}: {str(e)}")
            return f"Error analyzing chunk {chunk_num}: {str(e)}"

    def generate_report(self, file_path):
        """Generate complete root cause analysis report"""
        print("🚀 Starting AI Debugging Assistant (Gemini)")

        df = self.load_kibana_logs(file_path)
        if df is None:
            return "❌ Failed to load log file"

        cleaned_df = self.preprocess_logs(df)
        if len(cleaned_df) == 0:
            return "❌ No relevant logs found after preprocessing"

        chunks = self.chunk_logs(cleaned_df)
        if not chunks:
            return "❌ No log chunks to analyze"

        analyses = []
        max_chunks = min(len(chunks), 5)  # free tier safety
        for i, chunk in enumerate(chunks[:max_chunks]):
            analysis = self.analyze_chunk(chunk, i + 1)
            analyses.append(analysis)
            if i < max_chunks - 1:
                time.sleep(4)

        return self.compile_final_report(analyses, len(cleaned_df), file_path)

    def compile_final_report(self, analyses, total_logs, file_path):
        """Compile all chunk analyses into final report"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        report = f"""# 🚨 AI Debugging Assistant - Root Cause Report

**Generated:** {timestamp}  
**Source File:** {file_path}  
**Total Logs Analyzed:** {total_logs}  
**Analysis Engine:** Google Gemini Pro  

---

"""
        for i, analysis in enumerate(analyses, 1):
            report += f"### Analysis Segment {i}\n\n{analysis}\n\n---\n\n"

        return report
