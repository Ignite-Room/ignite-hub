import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Download, CheckCircle2, XCircle, RefreshCw, Key, PlayCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';

export default function ExternalVerificationPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string>('');
    const [headers, setHeaders] = useState<string[]>([]);
    const [dataRows, setDataRows] = useState<string[][]>([]);
    const [results, setResults] = useState<Record<string, boolean>>({});
    const [githubColIndex, setGithubColIndex] = useState<number>(-1);
    const [githubToken, setGithubToken] = useState('');
    
    // Manage cancellation of long running fetch
    const abortRef = useRef<boolean>(false);

    const parseCSV = (text: string) => {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        return lines.map(line => {
            const result = [];
            let cur = '';
            let inQuote = false;
            for (let i = 0; i < line.length; i++) {
                if (line[i] === '"') {
                    inQuote = !inQuote;
                } else if (line[i] === ',' && !inQuote) {
                    result.push(cur);
                    cur = '';
                } else {
                    cur += line[i];
                }
            }
            result.push(cur);
            return result.map(c => c.trim().replace(/^"|"$/g, ''));
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
        setError('');
        setResults({});
        setProgress({ current: 0, total: 0 });
        
        try {
            const text = await uploadedFile.text();
            const parsed = parseCSV(text);
            
            if (parsed.length < 2) {
                setError('CSV file needs at least a header row and one data row.');
                return;
            }

            const headerRow = parsed[0];
            setHeaders(headerRow);
            
            const githubIndex = headerRow.findIndex(h => h.toLowerCase().includes('github'));
            if (githubIndex === -1) {
                setError('Could not find a column containing "github" or "GitHub" in the headers.');
                return;
            }
            
            setGithubColIndex(githubIndex);
            
            const rows = parsed.slice(1);
            setDataRows(rows);
            
            // Just scan to ensure we have usernames
            const hasUsers = rows.some(r => r[githubIndex] && r[githubIndex].trim() !== '');
            if (!hasUsers) {
                setError('No valid GitHub usernames found in the data rows.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to parse CSV file.');
        }
    };
    
    const extractCleanUsername = (originalName: string) => {
        let cleanName = originalName.trim();
        if (cleanName.includes('github.com/')) {
            cleanName = cleanName.split('github.com/')[1];
        }
        cleanName = cleanName.replace('@', '');
        return cleanName.split('/')[0].split('?')[0].split('#')[0];
    };

    const startVerification = async () => {
        if (dataRows.length === 0 || githubColIndex === -1) return;
        
        setLoading(true);
        setError('');
        abortRef.current = false;
        
        const totalRows = dataRows.length;
        setProgress({ current: 0, total: totalRows });
        
        const fetchHeaders: Record<string, string> = {};
        if (githubToken) {
            fetchHeaders['Authorization'] = `token ${githubToken.trim()}`;
        }
        
        const newResults = { ...results };

        for (let i = 0; i < totalRows; i++) {
            if (abortRef.current) break;
            
            setProgress({ current: i + 1, total: totalRows });
            
            const originalName = dataRows[i][githubColIndex];
            if (!originalName || originalName.trim() === '') continue;
            
            // Skip if already successfully verified in a previous partial run
            if (newResults[originalName]) continue;
            
            const username = extractCleanUsername(originalName);
            if (!username) continue;
            
            try {
                let starred = false;
                let page = 1;
                const maxPages = 5; // Check up to 500 latest stars
                
                while (page <= maxPages) {
                    const res = await fetch(`https://api.github.com/users/${username}/starred?per_page=100&page=${page}`, { 
                        headers: fetchHeaders 
                    });
                    
                    if (!res.ok) {
                        if (res.status === 403 || res.status === 429) {
                            setError(`GitHub Rate Limit Hit processing user ${username}. Consider using a Github PAT token or waiting.`);
                            abortRef.current = true;
                        }
                        break; 
                    }
                    
                    const stars = await res.json();
                    if (!Array.isArray(stars) || stars.length === 0) {
                        break;
                    }
                    
                    const found = stars.some((repo: any) => 
                        repo.full_name === 'daytonaio/daytona' || 
                        repo.html_url === 'https://github.com/daytonaio/daytona'
                    );
                    
                    if (found) {
                        starred = true;
                        break;
                    }
                    
                    if (stars.length < 100) break;
                    page++;
                }
                
                newResults[originalName] = starred;
                // Update state periodically to show progress
                if (i % 5 === 0) {
                    setResults({ ...newResults });
                }
                
                // Rate limit spacing against GitHub's secondary limits
                await new Promise(r => setTimeout(r, githubToken ? 100 : 300));
            } catch (err) {
                console.error('Fetch error:', err);
                newResults[originalName] = false;
            }
        }
        
        setResults({ ...newResults });
        setLoading(false);
    };

    const stopVerification = () => {
        abortRef.current = true;
        setLoading(false);
    };

    const generateDownload = () => {
        if (dataRows.length === 0 || headers.length === 0) return;
        
        const newHeaders = [...headers, 'Auto Verification'];
        const csvRows = [newHeaders];
        
        dataRows.forEach(row => {
            const githubVal = row[githubColIndex];
            const isVerified = githubVal ? (results[githubVal] ? 'TRUE' : 'FALSE') : 'FALSE';
            
            const escapedRow = [...row, isVerified].map(val => {
                const cell = val === undefined || val === null ? '' : String(val);
                if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                    return `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            });
            csvRows.push(escapedRow);
        });
        
        const csvContent = csvRows.map(r => r.join(',')).join('\\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `verified_${file?.name || 'export.csv'}`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const progressPercentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
        <AdminLayout title="External Verification" breadcrumb={['Admin', 'Ambassador Program']}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Box 1: File Upload */}
                        <div className="glass-card rounded-2xl p-6 border border-border/50 text-center">
                            <UploadCloud className="w-10 h-10 text-primary mx-auto mb-3" />
                            <h2 className="text-xl font-bold mb-2">1. Upload CSV File</h2>
                            <p className="text-sm text-muted-foreground mb-6 h-14">
                                Target column must contain "GitHub" or "github". Processes up to ~2,000 users.
                            </p>
                            
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Button className="w-full gap-2" variant={file ? "outline" : "default"}>
                                    <UploadCloud className="w-4 h-4" /> {file ? `Loaded: ${file.name}` : 'Select CSV File'}
                                </Button>
                            </div>
                        </div>

                        {/* Box 2: Configuration & Exec */}
                        <div className="glass-card rounded-2xl p-6 border border-border/50 text-center opacity-100 flex flex-col justify-between">
                           <div>
                                <Key className="w-10 h-10 text-primary mx-auto mb-3" />
                                <h2 className="text-xl font-bold mb-2">2. Verify Settings</h2>
                                <p className="text-sm text-muted-foreground mb-4 h-10">
                                    A GitHub token handles 5000 req/hr ensuring no failures for large lists of users.
                                </p>
                                
                                <input 
                                    type="password" 
                                    placeholder="GitHub PAT (Optional but REQUIRED for batches > 60)" 
                                    value={githubToken}
                                    onChange={e => setGithubToken(e.target.value)}
                                    className="w-full h-10 px-4 rounded-xl bg-background border border-border text-sm mb-4"
                                />
                           </div>

                            {loading ? (
                                <Button onClick={stopVerification} variant="destructive" className="w-full gap-2 font-bold cursor-pointer relative z-20">
                                   <XCircle className="w-4 h-4 " /> Stop Verification
                                </Button>
                            ) : (
                                <Button onClick={startVerification} disabled={dataRows.length === 0} className="w-full gap-2 relative z-20">
                                   <PlayCircle className="w-4 h-4" /> Start Verifying {dataRows.length > 0 && `(${dataRows.length} users)`}
                                </Button>
                            )}
                        </div>
                    </div>

                    {loading && (
                        <div className="glass-card p-6 border-primary/30 border rounded-2xl">
                             <div className="flex justify-between items-end mb-2">
                                 <div>
                                    <p className="font-bold text-primary mb-1">Verifying...</p>
                                    <p className="text-sm text-muted-foreground">Fetching GitHub paginated data slowly to avoid abuse bans.</p>
                                 </div>
                                 <p className="font-bold tabular-nums">{progress.current} / {progress.total}</p>
                             </div>
                             <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                                  <div className="bg-primary h-3 transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }} />
                             </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex gap-3 text-sm font-medium items-center">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {dataRows.length > 0 && (
                        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden mt-6">
                            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-lg">Results Workspace</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Click "Start Verifying" above to populate results.</p>
                                </div>
                                <Button onClick={generateDownload} variant="outline" className="gap-1.5 h-9">
                                    <Download className="w-4 h-4" /> Export Enriched CSV
                                </Button>
                            </div>
                            <div className="overflow-x-auto max-h-[60vh]">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                                        <tr>
                                            {headers.map((h, i) => (
                                                <th key={i} className="px-5 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">
                                                    {h}
                                                </th>
                                            ))}
                                            <th className="px-5 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider sticky right-0 bg-secondary/90">
                                                Auto Verif
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {dataRows.map((row, i) => {
                                            const githubVal = row[githubColIndex];
                                            const isVerified = githubVal ? results[githubVal] : undefined;
                                            return (
                                                <tr key={i} className="hover:bg-secondary/20 transition-colors">
                                                    {row.map((cell, j) => (
                                                        <td key={j} className="px-5 py-3 text-foreground">
                                                            {cell}
                                                        </td>
                                                    ))}
                                                    <td className="px-5 py-3 sticky right-0 bg-background/90 tabular-nums font-medium">
                                                        {isVerified === true && (
                                                            <span className="flex items-center gap-1.5 text-green-500">
                                                                <CheckCircle2 className="w-4 h-4" /> TRUE
                                                            </span>
                                                        )}
                                                        {isVerified === false && (
                                                            <span className="flex items-center gap-1.5 text-red-500">
                                                                <XCircle className="w-4 h-4" /> FALSE
                                                            </span>
                                                        )}
                                                        {isVerified === undefined && (
                                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                                <RefreshCw className="w-3.5 h-3.5" /> PENDING
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
        </AdminLayout>
    );
}
