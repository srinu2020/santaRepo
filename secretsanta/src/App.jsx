import { useState, useEffect, useRef } from 'react'
import { employeeAPI, assignmentAPI } from './services/api'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

function App() {
  const [participants, setParticipants] = useState([]) // Employee list from backend [{code, name}]
  const [assignedPairs, setAssignedPairs] = useState({}) // { giverCode: {receiverCode, receiverName} }
  const [currentCode, setCurrentCode] = useState('')
  const [loggedInEmployee, setLoggedInEmployee] = useState(null) // "Authenticated" employee
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinningName, setSpinningName] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef(null)
  const musicTimeoutRef = useRef(null)

  // Load employees and assignments from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [employees, assignments] = await Promise.all([
          employeeAPI.getAll(),
          assignmentAPI.getAll()
        ])
        setParticipants(employees)
        setAssignedPairs(assignments)

        // Restore "logged in" employee from localStorage if present
        try {
          const stored = localStorage.getItem('ss_logged_in_employee')
          if (stored) {
            const parsed = JSON.parse(stored)
            // Ensure the employee still exists in the latest list
            const stillExists = employees.find(
              (e) => e.code.toUpperCase() === parsed.code?.toUpperCase()
            )
            if (stillExists) {
              setLoggedInEmployee(stillExists)
              setCurrentCode(stillExists.code)
            } else {
              localStorage.removeItem('ss_logged_in_employee')
            }
          }
        } catch (e) {
          console.error('Failed to restore logged in employee from storage', e)
          localStorage.removeItem('ss_logged_in_employee')
        }
      } catch (err) {
        toast.error('Failed to load data from server. Please make sure the backend is running.', {
          position: "top-center",
          autoClose: 5000,
        })
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Whenever a user is "logged in", fetch their existing assignment (if any)
  // so the UI clearly shows who they are assigned to, even after reload.
  useEffect(() => {
    const loadExistingAssignment = async () => {
      if (!loggedInEmployee) {
        setResult(null)
        return
      }
      try {
        const assignmentData = await assignmentAPI.getByEmployeeCode(loggedInEmployee.code)
        if (assignmentData.hasAssignment) {
          setResult(assignmentData.assignment)
        } else {
          setResult(null)
        }
      } catch (err) {
        // If 404, no assignment yet – clear any previous result
        if (err.response?.status === 404) {
          setResult(null)
        } else {
          console.error('Failed to load existing assignment for logged-in employee', err)
        }
      }
    }

    loadExistingAssignment()
  }, [loggedInEmployee])

  // Simple "login" using employee code only
  const handleLogin = async () => {
    setError('')

    if (currentCode.trim() === '') {
      toast.error('Please enter your employee code', {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    const code = currentCode.trim().toUpperCase()

    // Check if code is in participants list (case-insensitive match)
    const matchedEmployee = participants.find(
      p => p.code.toUpperCase() === code
    )
    
    if (!matchedEmployee) {
      toast.error('Invalid employee code. Please check and try again.', {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    // Optional: Check if someone already used this code and show their assignment
    try {
      const assignmentData = await assignmentAPI.getByEmployeeCode(matchedEmployee.code)
      if (assignmentData.hasAssignment) {
        const existingAssignment = assignmentData.assignment
        toast.warning(`This employee code has already been used! You are assigned to gift: ${existingAssignment.receiverName}`, {
          position: "top-center",
          autoClose: 5000,
        })
        setResult(existingAssignment)
        // Still allow them to "log in" so they can see their result again
      }
    } catch (err) {
      // If 404, no assignment exists yet – continue
      if (err.response?.status !== 404) {
        toast.error('Failed to verify employee code. Please try again.', {
          position: "top-center",
          autoClose: 3000,
        })
        return
      }
    }

    setLoggedInEmployee(matchedEmployee)
    setCurrentCode(matchedEmployee.code) // normalize format
    localStorage.setItem('ss_logged_in_employee', JSON.stringify({ code: matchedEmployee.code }))
    toast.success(`Welcome, ${matchedEmployee.name}!`, {
      position: "top-center",
      autoClose: 2000,
    })
  }

  const pickSecretSanta = async () => {
    setError('')
    setResult(null)
    setShowConfetti(false)

    // Start background music when user clicks Spin (explicit interaction)
    if (audioRef.current) {
      try {
        // Clear any previous stop timer
        if (musicTimeoutRef.current) {
          clearTimeout(musicTimeoutRef.current)
        }

        // Jump to 7 seconds before playing
        audioRef.current.currentTime = 7
        await audioRef.current.play()

        // Stop after 30 seconds of playback
        musicTimeoutRef.current = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause()
          }
        }, 30000)
      } catch (e) {
        console.error('Failed to start background music', e)
      }
    }

    if (!loggedInEmployee) {
      toast.error('Please log in with your employee code first.', {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    const matchedEmployee = loggedInEmployee
    const exactCode = loggedInEmployee.code
    
    // Check if this employee code already has an assignment (fetch from API)
    try {
      const assignmentData = await assignmentAPI.getByEmployeeCode(exactCode)
      if (assignmentData.hasAssignment) {
        const existingAssignment = assignmentData.assignment
        // Show their existing assignment instead of allowing another spin
        toast.warning(`This employee code has already been used! You are assigned to gift: ${existingAssignment.receiverName}`, {
          position: "top-center",
          autoClose: 5000,
        })
        setResult(existingAssignment)
        return
      }
    } catch (err) {
      // If 404, no assignment exists, continue with spinning
      if (err.response?.status !== 404) {
        toast.error('Failed to check assignment. Please try again.', {
          position: "top-center",
          autoClose: 3000,
        })
        return
      }
    }
    
    // Edge Case 2: Additional check - if all employees are assigned, show message
    if (Object.keys(assignedPairs).length >= participants.length) {
      toast.info('All employees have already been assigned!', {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    // Edge Case 2: Check if someone else already used this code (additional check)
    // This is handled by the backend, but we can show a warning if needed

    try {
      // Get available recipients from backend
      const availableReceivers = await assignmentAPI.getAvailable(exactCode)

      if (availableReceivers.length === 0) {
        toast.error('No more available recipients! Everyone has been assigned.', {
          position: "top-center",
          autoClose: 3000,
        })
        return
      }

      // Start spinning animation
      setIsSpinning(true)
      setSpinningName('')
      
      // Create spinning effect by cycling through names
      let spinCount = 0
      const spinDuration = 10000 // 10 seconds of spinning
      const spinInterval = 50 // Change name every 50ms
      const totalSpins = spinDuration / spinInterval
      
      const spinIntervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * availableReceivers.length)
        setSpinningName(availableReceivers[randomIndex].name)
        spinCount++
        
        if (spinCount >= totalSpins) {
          clearInterval(spinIntervalId)
          
          // Final selection
          const finalRandomIndex = Math.floor(Math.random() * availableReceivers.length)
          const selectedReceiver = availableReceivers[finalRandomIndex]
          
          // Save the assignment to backend
          assignmentAPI.create(exactCode, selectedReceiver.code)
            .then((response) => {
              // Create assignment object
              const assignmentResult = { 
                giverCode: exactCode,
                giverName: matchedEmployee.name,
                receiverCode: selectedReceiver.code,
                receiverName: selectedReceiver.name
              }
              // Keep the employee code in the input field
              setCurrentCode(exactCode)
              
              // Update local state
              const newPairs = { 
                ...assignedPairs, 
                [exactCode]: {
                  receiverCode: selectedReceiver.code,
                  receiverName: selectedReceiver.name
                }
              }
              setAssignedPairs(newPairs)
              
              // Show success toast
              toast.success(`🎉 Success! You are assigned to gift: ${selectedReceiver.name}`, {
                position: "top-center",
                autoClose: 5000,
              })
              
              // Show result with delay for dramatic effect
              setTimeout(() => {
                setIsSpinning(false)
                setResult(assignmentResult)
                setShowConfetti(true)
                // Keep the employee code in the input field (don't clear it)
                
                // Hide confetti after animation
                setTimeout(() => setShowConfetti(false), 3000)
              }, 300)
            })
            .catch((err) => {
              setIsSpinning(false)
              const errorMsg = err.response?.data?.error || 'Failed to save assignment. Please try again.'
              
              // Check for specific error types
              if (errorMsg.includes('already has an assignment')) {
                toast.warning('This employee code already has an assignment. Please use your own code.', {
                  position: "top-center",
                  autoClose: 5000,
                })
              } else {
                toast.error(errorMsg, {
                  position: "top-center",
                  autoClose: 4000,
                })
              }
            })
        }
      }, spinInterval)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to get available recipients. Please try again.'
      toast.error(errorMsg, {
        position: "top-center",
        autoClose: 4000,
      })
      console.error('Error picking secret santa:', err)
    }
  }

  const resetAll = async () => {
    if (window.confirm('Are you sure you want to reset all assignments? This cannot be undone.')) {
      try {
        await assignmentAPI.reset()
        setAssignedPairs({})
        setResult(null)
        setError('')
        setCurrentCode('')
        toast.success('All assignments have been reset successfully!', {
          position: "top-center",
          autoClose: 3000,
        })
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to reset assignments. Please try again.', {
          position: "top-center",
          autoClose: 4000,
        })
        console.error('Error resetting assignments:', err)
      }
    }
  }

  const assignedCount = Object.keys(assignedPairs).length
  const totalParticipants = participants.length

  if (loading) {
    return (
      <div className="app">
        <header>
          <h1>🎅</h1>
        </header>
        <div className="main-content">
          <div className="loading-message">Loading...</div>
        </div>
      </div>
    )
  }

  // Login screen: employee enters their code once
  if (!loggedInEmployee) {
    return (
      <div className="app">
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        {/* Background Christmas music (started when spinning, plays 30s from 7s) */}
        <audio
          ref={audioRef}
          src="/Christmas Carols - Jingle Bells.mp3"
        />
        {/* Background Christmas music */}
        <audio
          src="/Christmas Carols - Jingle Bells.mp3"
          autoPlay
          loop
        />
        <header>
          <h1>🎅</h1>
        </header>

        <div className="main-content">
          <section className="section">
            <h2>🎁 Join the Secret Santa List</h2>
            <div className="pick-form">
              <input
                type="text"
                placeholder="Enter your employee code"
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="input input-large"
                style={{ textTransform: 'uppercase' }}
              />
              <button 
                onClick={handleLogin} 
                className="btn btn-primary btn-large"
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Background Christmas music (started when spinning, plays 30s from 7s) */}
      <audio
        ref={audioRef}
        src="/Christmas Carols - Jingle Bells.mp3"
      />
      <header>
        <h1>🎅</h1>
      </header>

      <div className="main-content">
          {/* Pick Secret Santa Section */}
          <section className="section">
            <h2>🎄 Pick Your Secret Santa 🎄</h2>
            {loggedInEmployee && (
              <div className="logged-in-banner">
                {!result ? (
                  <p>
                    Welcome, <strong>{loggedInEmployee.name}</strong> ({loggedInEmployee.code})! 🎅<br />
                    When you’re ready, spin the wheel below to meet your Secret Santa match.
                  </p>
                ) : (
                  <p>
                    Shh! Your Secret Santa identity is now set for this device – keep it safe and keep it secret. 🤫🎁
                  </p>
                )}
              </div>
            )}
            <div className="pick-form">
              {/* Employee code is fixed after login, so we no longer allow editing it here */}
              <button 
                onClick={pickSecretSanta} 
                className="btn btn-primary btn-large"
                disabled={isSpinning}
              >
                {isSpinning ? '🎅 Spinning...' : '🎲 Spin the Wheel!'}
              </button>
            </div>

            {/* Spinning Wheel Animation */}
            {isSpinning && (
              <div className="spinning-wheel-container">
                <div className="spinning-wheel">
                  <div className="wheel-center">🎅</div>
                  <div className="wheel-spinner"></div>
                </div>
                <div className="spinning-name-display">
                  <div className="spinning-text">{spinningName || '...'}</div>
                  <div className="spinning-subtitle">🎁 Picking your person... 🎁</div>
                </div>
              </div>
            )}

            {/* Confetti Effect */}
            {showConfetti && (
              <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                  <div key={i} className={`confetti confetti-${i % 5}`}></div>
                ))}
              </div>
            )}

            {result && !isSpinning && (
              <div className="result-card">
                <div className="result-header">🎉 Your Secret Santa Assignment 🎉</div>
                <div className="result-content">
                  <div className="result-name">
                    <span className="label">You are gifting to:</span>
                    <span className="name">{result.receiverName}</span>
                  </div>
                </div>
                <div className="result-footer">
                  <p>🎁 Keep this secret until gift exchange day! 🤫</p>
                </div>
              </div>
            )}

            <div className="progress-info">
              <p>📊 {assignedCount} of {totalParticipants} employees have picked</p>
              {assignedCount === totalParticipants && assignedCount > 0 && (
                <p style={{ color: '#4CAF50', fontWeight: 'bold', marginTop: '10px' }}>
                  🎉 All employees have been assigned! 🎉
                </p>
              )}
            </div>
          </section>
        </div>
    </div>
  )
}

export default App

