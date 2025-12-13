import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Calendar, TrendingUp, Award, Zap, BookOpen, Target, Settings, Github, Linkedin, Instagram, User } from "lucide-react";

export default function App() {
  const [step, setStep] = useState(1); // 1: Login, 2: Dashboard, 3: Config, 4: Results
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Login states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Config states
  const [semesterEnd, setSemesterEnd] = useState("2025-11-28");
  const [targetPercent, setTargetPercent] = useState(75);
  const [simulate, setSimulate] = useState(2);
  const [holidays, setHolidays] = useState("");
  const [timetable, setTimetable] = useState({
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0
  });

  // Fetch initial attendance data
  async function handleLogin() {
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("https://attendance-maker-nt1j.onrender.com/fetch-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      
      if (response.ok) {
        setData(result);
        setStep(2); // Go to dashboard
      } else {
        alert(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect. Check if backend is running on port 3000.");
    } finally {
      setLoading(false);
    }
  }

  // Open configuration with saved data
  async function handleOpenConfig() {
    setLoading(true);
    try {
      const configResponse = await fetch(`https://attendance-maker-nt1j.onrender.com/get-config/${username}`);
      if (configResponse.ok) {
        const savedConfig = await configResponse.json();
        if (savedConfig.config) {
          setTimetable(savedConfig.config.timetable);
          setHolidays(savedConfig.config.holidays.join(", "));
          setSemesterEnd(savedConfig.config.semesterEnd);
          setTargetPercent(savedConfig.config.targetPercent);
          setSimulate(savedConfig.config.simulate);
        }
      }
      setStep(3); // Go to config page
    } catch (error) {
      console.error("Error:", error);
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  // Save config and calculate
  async function handleSaveConfig() {
    setLoading(true);

    try {
      const holidayArray = holidays
        .split(',')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      const response = await fetch("https://attendance-maker-nt1j.onrender.com/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          semesterEnd,
          timetable,
          holidays: holidayArray,
          targetPercent: Number(targetPercent),
          simulate: Number(simulate)
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Add currentAttendance calculation to result
        result.currentAttendance = ((result.pastAttended / result.pastTotal) * 100).toFixed(2);
        setData(result);
        setStep(4); // Go to results
      } else {
        alert(result.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 md:p-8 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="text-[40rem] font-black text-white/10 select-none">
            <img src="https://upload.wikimedia.org/wikipedia/en/e/e5/Official_logo_of_VNRVJIET.png" alt="College Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Attendance Pro
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Track your academic journey with style</p>
        </div>

        {/* STEP 1: LOGIN FORM */}
        {step === 1 && (
          <div className="max-w-md mx-auto backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Login to Continue
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">ERP Username</label>
                <input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all duration-300" 
                  placeholder="23071A1234" 
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">ERP Password</label>
                <input 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all duration-300" 
                  placeholder="••••••••" 
                  type="password" 
                />
              </div>

              <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      Login & View Attendance
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DASHBOARD - Basic Attendance View */}
        {step === 2 && data && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Circular Progress Card */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl border border-white/20 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Current Attendance
                  </h2>
                </div>

                <div className="w-48 h-48 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                  <CircularProgressbar
                    value={parseFloat(data.currentAttendance || ((data.pastAttended / data.pastTotal) * 100).toFixed(2))}
                    text={`${data.currentAttendance || ((data.pastAttended / data.pastTotal) * 100).toFixed(2)}%`}
                    styles={buildStyles({
                      textColor: "#fff",
                      textSize: "20px",
                      pathColor: parseFloat(data.currentAttendance || ((data.pastAttended / data.pastTotal) * 100).toFixed(2)) >= 75 
                        ? "#10b981" 
                        : "#ef4444",
                      trailColor: "rgba(255,255,255,0.1)",
                      pathTransitionDuration: 1.5,
                    })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Attended</p>
                    <p className="font-bold text-cyan-300">{data.pastAttended}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Total</p>
                    <p className="font-bold text-purple-300">{data.pastTotal}</p>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Next Steps
                  </h2>
                </div>

                <p className="text-gray-300 mb-6">
                  Want to know how many classes you can bunk? Configure your timetable and semester details to calculate bunkable classes!
                </p>

                <button 
                  onClick={handleOpenConfig}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Settings className="w-5 h-5" />
                        Configure & Calculate
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            {/* SUBJECT CARDS */}
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
                Subject-wise Attendance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.subjects.map((sub) => {
                const percent = ((sub.attended / sub.total) * 100).toFixed(2);
                const isGood = percent >= 75;
                
                return (
                  <div 
                    key={sub.subject} 
                    className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${isGood ? 'from-green-500/10 to-cyan-500/10' : 'from-orange-500/10 to-red-500/10'} blur-xl`}></div>
                    
                    <div className="relative z-10">
                      <h3 className="font-black text-xl mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {sub.subject}
                      </h3>
                      
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-black bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                          {percent}%
                        </span>
                        <span className="text-gray-400 mb-1">
                          {sub.attended}/{sub.total}
                        </span>
                      </div>

                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/20">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            isGood 
                              ? 'bg-gradient-to-r from-green-400 to-cyan-400' 
                              : 'bg-gradient-to-r from-orange-400 to-red-400'
                          } shadow-lg`}
                          style={{ 
                            width: `${Math.min(percent, 100)}%`,
                            boxShadow: isGood 
                              ? '0 0 20px rgba(6, 182, 212, 0.5)' 
                              : '0 0 20px rgba(251, 146, 60, 0.5)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: CONFIGURATION FORM */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Configure Attendance Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Semester End Date</label>
                <input 
                  value={semesterEnd}
                  onChange={(e) => setSemesterEnd(e.target.value)}
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all duration-300" 
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Target Percentage</label>
                <input 
                  value={targetPercent}
                  onChange={(e) => setTargetPercent(e.target.value)}
                  type="number"
                  min="0"
                  max="100"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all duration-300" 
                  placeholder="75" 
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Simulate (days to bunk)</label>
                <input 
                  value={simulate}
                  onChange={(e) => setSimulate(e.target.value)}
                  type="number"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all duration-300" 
                  placeholder="2" 
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Holidays (comma-separated dates)</label>
                <input 
                  value={holidays}
                  onChange={(e) => setHolidays(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all duration-300" 
                  placeholder="2025-11-29, 2025-12-25" 
                />
              </div>
            </div>

            {/* Timetable */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-3 block">Weekly Timetable (Classes per day)</label>
              <div className="grid grid-cols-7 gap-3">
                {Object.keys(timetable).map(day => (
                  <div key={day} className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <label className="text-xs text-gray-400 block mb-2">{day}</label>
                    <input 
                      value={timetable[day]}
                      onChange={(e) => setTimetable({...timetable, [day]: Number(e.target.value)})}
                      type="number"
                      min="0"
                      max="10"
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white text-center focus:outline-none focus:border-cyan-400" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
              >
                Back to Dashboard
              </button>
              
              <button 
                onClick={handleSaveConfig}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Save & Calculate
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: RESULTS */}
        {step === 4 && data && (
          <div className="animate-fade-in">
            {/* Navigation Buttons */}
            <div className="mb-6 flex gap-4">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              >
                ← Back to Dashboard
              </button>
              <button 
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Reconfigure
              </button>
            </div>

            {/* OVERALL SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Circular Progress Card */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl border border-white/20 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Max Possible Attendance
                  </h2>
                </div>

                <div className="w-48 h-48 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                  <CircularProgressbar
                    value={parseFloat(data.maxPossibleAttendance)}
                    text={`${data.maxPossibleAttendance}%`}
                    styles={buildStyles({
                      textColor: "#fff",
                      textSize: "20px",
                      pathColor: parseFloat(data.maxPossibleAttendance) >= 75 
                        ? "#10b981" 
                        : "#ef4444",
                      trailColor: "rgba(255,255,255,0.1)",
                      pathTransitionDuration: 1.5,
                    })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Past</p>
                    <p className="font-bold text-cyan-300">{data.pastAttended}/{data.pastTotal}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Bunkable</p>
                    <p className="font-bold text-purple-300">{data.bunkable}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Remaining</p>
                    <p className="font-bold text-pink-300">{data.remainingClasses}</p>
                  </div>
                </div>
              </div>

              {/* SUMMARY BOX */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Summary
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-400/30">
                    <p className="text-gray-400 text-sm mb-1">Needed to Reach Target</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                      {data.neededToReach}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
                    <p className="text-gray-400 text-sm mb-1">Simulated Attendance</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                      {data.simulatedAttendance}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
                    <p className="text-gray-400 text-sm mb-1">Target Reachable</p>
                    <p className="text-2xl font-black bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                      {data.reachable ? "✓ YES" : "✗ NO"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Report Generated</p>
                      <p className="font-bold text-white">{new Date(data.startDate).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBJECT CARDS */}
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
                Subject-wise Breakdown
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.subjects.map((sub) => {
                const percent = ((sub.attended / sub.total) * 100).toFixed(2);
                const isGood = percent >= 75;
                
                return (
                  <div 
                    key={sub.subject} 
                    className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${isGood ? 'from-green-500/10 to-cyan-500/10' : 'from-orange-500/10 to-red-500/10'} blur-xl`}></div>
                    
                    <div className="relative z-10">
                      <h3 className="font-black text-xl mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {sub.subject}
                      </h3>
                      
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-black bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                          {percent}%
                        </span>
                        <span className="text-gray-400 mb-1">
                          {sub.attended}/{sub.total}
                        </span>
                      </div>

                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/20">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            isGood 
                              ? 'bg-gradient-to-r from-green-400 to-cyan-400' 
                              : 'bg-gradient-to-r from-orange-400 to-red-400'
                          } shadow-lg`}
                          style={{ 
                            width: `${Math.min(percent, 100)}%`,
                            boxShadow: isGood 
                              ? '0 0 20px rgba(6, 182, 212, 0.5)' 
                              : '0 0 20px rgba(251, 146, 60, 0.5)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/5 border-t border-white/10 py-4 z-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              Created by <span className="text-white font-bold">Rushi bhai</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* <a 
              href="https://instagram.com/yourhandle" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-pink-500/20 hover:border-pink-500/50 transition-all duration-300 hover:scale-110"
            >
              <Instagram className="w-5 h-5 text-pink-400" />
            </a> */}
            
            {/* <a 
              href="https://github.com/yourhandle" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-gray-500/20 hover:border-gray-500/50 transition-all duration-300 hover:scale-110"
            >
              <Github className="w-5 h-5 text-gray-400" />
            </a> */}
            
            <a 
              href="https://www.linkedin.com/in/rushindhra-marri/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-110"
            >
              <Linkedin className="w-5 h-5 text-blue-400" />
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
