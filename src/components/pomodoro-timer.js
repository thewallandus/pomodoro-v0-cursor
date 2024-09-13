"use client"

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Circle, Sparkles, Coffee, RefreshCw, Trash2, Edit2 } from 'lucide-react'
import { motion } from 'framer-motion'

// Constants for timer durations and cycles
const POMODORO_TIME = 25 * 60
const SHORT_BREAK_TIME = 5 * 60
const LONG_BREAK_TIME = 15 * 60
const POMODORO_CYCLES = 4

export default function EnhancedPomodoroTimer() {
  // State variables for managing the timer and tasks
  const [time, setTime] = useState(POMODORO_TIME)
  const [isActive, setIsActive] = useState(false)
  const [activeTab, setActiveTab] = useState("pomodoro")
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [isBreakTime, setIsBreakTime] = useState(false)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [editingTask, setEditingTask] = useState(null)

  // Load saved state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('pomodoroState')
    if (savedState) {
      const { time, isActive, activeTab, pomodoroCount, cycleCount, isBreakTime, tasks } = JSON.parse(savedState)
      setTime(time)
      setIsActive(isActive)
      setActiveTab(activeTab)
      setPomodoroCount(pomodoroCount)
      setCycleCount(cycleCount)
      setIsBreakTime(isBreakTime)
      setTasks(tasks || [])
    }
  }, [])

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify({ time, isActive, activeTab, pomodoroCount, cycleCount, isBreakTime, tasks }))
  }, [time, isActive, activeTab, pomodoroCount, cycleCount, isBreakTime, tasks])

  // Timer logic: decrement time when active, handle completion
  useEffect(() => {
    let interval = null

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      handleTimerComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, time])

  // Handle spacebar press to toggle timer
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
        event.preventDefault()
        toggleTimer()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isActive])

  // Toggle timer between active and inactive states
  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  // Reset timer based on the selected tab (pomodoro, short break, long break)
  const resetTimer = useCallback((tab) => {
    setIsActive(false)
    switch (tab) {
      case "pomodoro":
        setTime(POMODORO_TIME)
        setIsBreakTime(false)
        break
      case "shortBreak":
        setTime(SHORT_BREAK_TIME)
        setIsBreakTime(true)
        break
      case "longBreak":
        setTime(LONG_BREAK_TIME)
        setIsBreakTime(true)
        break
    }
    setActiveTab(tab)
  }, [])

  // Handle timer completion: play sound, update counts, and switch modes
  const handleTimerComplete = () => {
    playSound()
    if (activeTab === "pomodoro") {
      const newPomodoroCount = pomodoroCount + 1
      setPomodoroCount(newPomodoroCount)
      if (newPomodoroCount % POMODORO_CYCLES === 0) {
        resetTimer("longBreak")
        setCycleCount(cycleCount + 1)
      } else {
        resetTimer("shortBreak")
      }
    } else {
      resetTimer("pomodoro")
    }
  }

  // Play a sound when the timer completes
  const playSound = () => {
    const audio = new Audio('/bell.mp3')
    audio.play()
  }

  // Format time in minutes:seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Add a new task to the list
  const addTask = (e) => {
    e.preventDefault()
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }])
      setNewTask('')
    }
  }

  // Toggle task completion status
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  // Delete a task from the list
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  // Start editing a task
  const startEditingTask = (task) => {
    setEditingTask(task)
    setNewTask(task.text)
  }

  // Update an existing task
  const updateTask = (e) => {
    e.preventDefault()
    if (newTask.trim()) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...task, text: newTask } : task
      ))
      setNewTask('')
      setEditingTask(null)
    }
  }

  // Reset all timer-related states
  const handleRefresh = () => {
    setTime(POMODORO_TIME)
    setIsActive(false)
    setActiveTab("pomodoro")
    setPomodoroCount(0)
    setCycleCount(0)
    setIsBreakTime(false)
  }

  // Render the component
  return (
    <div className={`min-h-screen ${isBreakTime ? 'bg-teal-300' : 'bg-rose-500'} flex flex-col items-center justify-center text-white transition-colors duration-1000`}>
      <h1 className="text-4xl font-bold mb-8 text-center">
        Work is God's Design for You
      </h1>
      {/* Main timer card with animation */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className={`w-96 ${isBreakTime ? 'bg-teal-200' : 'bg-rose-400'} overflow-hidden transition-colors duration-1000`}>
          <CardContent className="p-6">
            {/* Timer tabs and display */}
            <Tabs value={activeTab} onValueChange={resetTimer}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
                <TabsTrigger value="longBreak">Long Break</TabsTrigger>
              </TabsList>
              <div className="text-center">
                <div className="text-8xl font-bold mb-6">{formatTime(time)}</div>
                <Button onClick={toggleTimer} className="w-full mb-4 text-xl py-6 relative overflow-hidden group">
                  <span className="relative z-10">{isActive ? 'PAUSE' : 'START'}</span>
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 0.2 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </div>
            </Tabs>
            {/* Cycle and focus/break information */}
            <div className="text-center mt-6">
              <p className="text-2xl font-semibold">#{cycleCount + 1}</p>
              <p className="text-lg">Time to {isBreakTime ? 'take a break' : 'focus'}!</p>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg">Pomodoros Completed: {pomodoroCount}</p>
            </div>
            {/* Animated motivational message */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {isBreakTime ? (
                <div className="flex justify-center items-center">
                  <Coffee className="mr-2" />
                  <span>Relax and recharge!</span>
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <Sparkles className="mr-2" />
                  <span>Stay focused and productive!</span>
                </div>
              )}
            </motion.div>
            {/* Restart button */}
            <motion.div
              className="mt-4 flex justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button onClick={handleRefresh} className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" /> Restart
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Task management section */}
      <motion.div
        className="mt-8 w-96"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4">Tasks</h2>
        {/* Task input form */}
        <form onSubmit={editingTask ? updateTask : addTask} className="mb-4 flex">
          <Input
            type="text"
            placeholder={editingTask ? "Update task" : "Add a new task"}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-grow mr-2 text-gray-800 placeholder-gray-500 bg-white"
          />
          <Button type="submit">{editingTask ? 'Update' : 'Add'}</Button>
        </form>
        {/* Task list */}
        <ul className="space-y-2">
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              className="flex items-center bg-white bg-opacity-20 rounded p-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Task completion toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleTask(task.id)}
                className="mr-2"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </Button>
              <span className={`flex-grow ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
              {/* Edit task button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEditingTask(task)}
                className="ml-2"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              {/* Delete task button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task.id)}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}