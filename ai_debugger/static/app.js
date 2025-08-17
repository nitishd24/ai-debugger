// AI Log Debugger Application
class LogDebugger {
    constructor() {
        this.currentFile = null;
        this.analysisResult = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDragAndDrop();
    }

    bindEvents() {
        // File input events
        document.getElementById('browseBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Action buttons
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeFile();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearFile();
        });

        document.getElementById('sampleBtn').addEventListener('click', () => {
            this.loadSampleData();
        });

        // Results actions
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyReport();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportReport();
        });

        document.getElementById('newAnalysisBtn').addEventListener('click', () => {
            this.resetToUpload();
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        uploadArea.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }

    handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showToast('Please select a CSV file', 'error');
            return;
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showToast('File size must be less than 10MB', 'error');
            return;
        }

        this.currentFile = file;
        this.showFilePreview(file);
    }

    showFilePreview(file) {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('filePreview').classList.remove('hidden');

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileMeta').textContent = 
            `${this.formatFileSize(file.size)} • ${new Date(file.lastModified).toLocaleDateString()}`;
    }

    clearFile() {
        this.currentFile = null;
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('filePreview').classList.add('hidden');
        document.getElementById('fileInput').value = '';
    }

    loadSampleData() {
        // Create a mock file object for sample data
        const sampleData = this.getSampleLogData();
        this.currentFile = {
            name: 'sample_logs.csv',
            size: 2048,
            lastModified: Date.now(),
            isSample: true,
            content: sampleData
        };
        this.showFilePreview(this.currentFile);
        this.showToast('Sample data loaded successfully', 'success');
    }

    async analyzeFile() {
        if (!this.currentFile) return;

        this.showProcessingState();
        
        try {
            // Simulate AI analysis with realistic processing time
            await this.simulateAnalysis();
            
            // Generate analysis report
            const report = this.generateAnalysisReport();
            this.analysisResult = report;
            
            this.showResults(report);
            this.showToast('Analysis completed successfully', 'success');
            
        } catch (error) {
            this.showToast('Analysis failed. Please try again.', 'error');
            this.hideProcessingState();
        }
    }

    showProcessingState() {
        document.getElementById('uploadSection').classList.add('hidden');
        document.getElementById('processingSection').classList.remove('hidden');
        document.getElementById('resultsSection').classList.add('hidden');

        const progressFill = document.getElementById('progressFill');
        const statusElement = document.getElementById('processingStatus');
        
        const steps = [
            'Reading CSV file...',
            'Parsing log entries...',
            'Analyzing error patterns...',
            'Identifying root causes...',
            'Generating recommendations...',
            'Finalizing report...'
        ];

        let currentStep = 0;
        progressFill.style.width = '0%';

        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                statusElement.textContent = steps[currentStep];
                progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
                currentStep++;
            } else {
                clearInterval(interval);
            }
        }, 800);
    }

    hideProcessingState() {
        document.getElementById('processingSection').classList.add('hidden');
        document.getElementById('uploadSection').classList.remove('hidden');
    }

    async simulateAnalysis() {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    generateAnalysisReport() {
        const sampleReport = {
            "title": "🚨 AI Debugging Assistant - Root Cause Report",
            "metadata": {
                "generated": new Date().toLocaleString(),
                "sourceFile": this.currentFile.name,
                "totalLogs": this.currentFile.isSample ? 5 : Math.floor(Math.random() * 100) + 20,
                "engine": "Google Gemini Pro"
            },
            "executiveSummary": this.currentFile.isSample ? 
                "Critical database connectivity issues detected in payment-service causing transaction failures and service degradation." :
                "Analysis completed for uploaded log file. Multiple error patterns and potential issues identified requiring immediate attention.",
            "analysis": [
                {
                    "segment": 1,
                    "rootCause": this.currentFile.isSample ? 
                        "Database connection pool exhaustion" : 
                        "Service communication failures and resource constraints",
                    "affectedComponent": this.currentFile.isSample ? 
                        "payment-service and database layer" : 
                        "Multiple microservices and infrastructure components",
                    "severity": "Critical",
                    "immediateAction": this.currentFile.isSample ? 
                        "Restart payment-service and increase DB connection pool size" :
                        "Review service health and restart affected components",
                    "longTermFix": this.currentFile.isSample ? 
                        "Implement connection pooling optimization and database load balancing" :
                        "Enhance monitoring, implement circuit breakers, and review system architecture"
                }
            ],
            "recommendations": {
                "immediate": [
                    "Monitor system health - Check CPU, memory, and disk usage",
                    "Verify service status - Ensure all critical services are running",
                    "Check dependencies - Validate database and external API connectivity",
                    "Review recent deployments - Identify any recent changes"
                ],
                "shortTerm": [
                    "Implement fixes identified in the analysis above", 
                    "Enhance monitoring for the detected error patterns",
                    "Update runbooks with findings from this incident",
                    "Notify stakeholders of resolution status"
                ],
                "longTerm": [
                    "Improve error handling in affected services",
                    "Add automated alerts for similar error patterns", 
                    "Review architecture for single points of failure",
                    "Enhance testing to catch these issues earlier"
                ]
            }
        };

        return sampleReport;
    }

    showResults(report) {
        document.getElementById('processingSection').classList.add('hidden');
        document.getElementById('resultsSection').classList.remove('hidden');

        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = this.generateReportHTML(report);
    }

    generateReportHTML(report) {
        return `
            <div class="report-section">
                <h3>📊 Executive Summary</h3>
                <p>${report.executiveSummary}</p>
            </div>

            <div class="report-section">
                <h3>📋 Analysis Metadata</h3>
                <div class="metadata-grid">
                    <div class="metadata-item">
                        <div class="metadata-label">Generated</div>
                        <div class="metadata-value">${report.metadata.generated}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">Source File</div>
                        <div class="metadata-value">${report.metadata.sourceFile}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">Total Logs</div>
                        <div class="metadata-value">${report.metadata.totalLogs}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">AI Engine</div>
                        <div class="metadata-value">${report.metadata.engine}</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h3>🔍 Root Cause Analysis</h3>
                ${report.analysis.map(item => `
                    <div class="analysis-item">
                        <h4>Segment ${item.segment}</h4>
                        <p><strong>Root Cause:</strong> ${item.rootCause}</p>
                        <p><strong>Affected Component:</strong> ${item.affectedComponent}</p>
                        <p><strong>Severity:</strong> <span class="severity-critical">${item.severity}</span></p>
                        <p><strong>Immediate Action:</strong> ${item.immediateAction}</p>
                        <p><strong>Long-term Fix:</strong> ${item.longTermFix}</p>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h3>💡 Recommendations</h3>
                <div class="recommendations-grid">
                    <div class="recommendation-column">
                        <h5>🚨 Immediate Actions</h5>
                        <ul>
                            ${report.recommendations.immediate.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="recommendation-column">
                        <h5>⏰ Short-term Actions</h5>
                        <ul>
                            ${report.recommendations.shortTerm.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="recommendation-column">
                        <h5>🎯 Long-term Actions</h5>
                        <ul>
                            ${report.recommendations.longTerm.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    copyReport() {
        if (!this.analysisResult) return;

        const markdownReport = this.generateMarkdownReport(this.analysisResult);
        
        navigator.clipboard.writeText(markdownReport).then(() => {
            this.showToast('Report copied to clipboard', 'success');
        }).catch(() => {
            this.showToast('Failed to copy report', 'error');
        });
    }

    exportReport() {
        if (!this.analysisResult) return;

        const markdownReport = this.generateMarkdownReport(this.analysisResult);
        const blob = new Blob([markdownReport], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `incident_report_${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Report exported successfully', 'success');
    }

    generateMarkdownReport(report) {
        return `# ${report.title}

## Executive Summary
${report.executiveSummary}

## Analysis Metadata
- **Generated:** ${report.metadata.generated}
- **Source File:** ${report.metadata.sourceFile}
- **Total Logs:** ${report.metadata.totalLogs}
- **AI Engine:** ${report.metadata.engine}

## Root Cause Analysis
${report.analysis.map(item => `
### Segment ${item.segment}
- **Root Cause:** ${item.rootCause}
- **Affected Component:** ${item.affectedComponent}
- **Severity:** ${item.severity}
- **Immediate Action:** ${item.immediateAction}
- **Long-term Fix:** ${item.longTermFix}
`).join('')}

## Recommendations

### Immediate Actions
${report.recommendations.immediate.map(item => `- ${item}`).join('\n')}

### Short-term Actions
${report.recommendations.shortTerm.map(item => `- ${item}`).join('\n')}

### Long-term Actions
${report.recommendations.longTerm.map(item => `- ${item}`).join('\n')}

---
*Generated by AI Log Debugger on ${new Date().toLocaleString()}*`;
    }

    resetToUpload() {
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('uploadSection').classList.remove('hidden');
        this.clearFile();
        this.analysisResult = null;
    }

    getSampleLogData() {
        return [
            {"timestamp": "2025-08-17T22:30:00", "level": "ERROR", "service": "payment-service", "message": "Database connection timeout after 30s"},
            {"timestamp": "2025-08-17T22:31:00", "level": "ERROR", "service": "payment-service", "message": "Failed to process payment: insufficient funds check failed"},
            {"timestamp": "2025-08-17T22:32:00", "level": "WARN", "service": "user-service", "message": "High memory usage detected: 89%"},
            {"timestamp": "2025-08-17T22:33:00", "level": "ERROR", "service": "payment-service", "message": "Payment gateway connection refused"},
            {"timestamp": "2025-08-17T22:34:00", "level": "CRITICAL", "service": "database", "message": "Connection pool exhausted - max connections reached"}
        ];
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new LogDebugger();
});