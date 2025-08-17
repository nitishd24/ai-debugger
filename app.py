import streamlit as st
import sys, os
import tempfile
import time

# Fix for package imports if running from project root
sys.path.append(os.path.dirname(__file__))

from ai_debugger import settings
from ai_debugger.debugger_providers.gemini_debugger import GeminiAIDebugger

# Initialize debugger
debugger = GeminiAIDebugger(settings.GEMINI_API_KEY)

# Page layout (full screen)
st.set_page_config(
    page_title="AI Log Debugger",
    page_icon="🛠️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# CSS to position toggle at top-right
st.markdown("""
<style>
.theme-toggle {
    position: fixed;
    top: 10px;
    right: 20px;
    z-index: 999;
}
</style>
""", unsafe_allow_html=True)

# Title and description
st.title("🛠️ AI Log Debugger")
st.markdown(
    """
    Analyze your application logs with AI-powered insights.
    Upload a CSV log file and generate an incident report with root cause analysis.
    """
)

# File uploader
uploaded_file = st.file_uploader("📂 Upload your CSV log file", type="csv")

# Notes / How to Use section below uploader
st.markdown("### 📝 Notes / How to Use")
st.markdown("""
1. Upload a CSV file containing your application logs.
2. Click **Analyze Logs** to start AI-powered analysis.
3. Review the generated incident report with root cause analysis.
4. Export or copy the report for your incident documentation.

**Tips:** Ensure CSV logs are properly formatted for accurate analysis.
""")

# Analyze button and processing
if uploaded_file is not None:
    file_details = f"Uploaded file: **{uploaded_file.name}** ({uploaded_file.size / 1024:.2f} KB)"
    st.info(file_details)

    analyze_button = st.button("Analyze Logs")

    if analyze_button:
        report_container = st.empty()
        progress_bar = st.progress(0)

        with st.spinner("Generating report..."):
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                tmp_file_path = tmp_file.name

            # Simulate progress for better UX
            for i in range(1, 11):
                time.sleep(0.2)
                progress_bar.progress(i * 10)
                report_container.text(f"Processing {i * 10}%...")

            # Generate AI report
            report = debugger.generate_report(tmp_file_path)

        # Display report in a styled text area
        st.subheader("📝 Suggested Incident Report")
        st.text_area("Report Output", report, height=400)

        # Download button
        st.download_button(
            label="📥 Download Report",
            data=report,
            file_name=f"incident_report_{uploaded_file.name}.md",
            mime="text/markdown"
        )

# Footer
st.markdown("---")
st.markdown(
    "<div style='text-align:center'>⚡ AI Debugger - Analyze logs quickly and efficiently</div>",
    unsafe_allow_html=True
)
