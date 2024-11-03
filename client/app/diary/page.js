// app/diary/page.js
"use client"; // Needed for Client Components in Next.js App Router

import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';
import { Brain, Search, Plus, Trash, Sparkles } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import styles from "./page.module.css";


const MedicalDiary = () => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const [exercises, setExercises] = useState([]);
  const [possibleConditions, setPossibleConditions] = useState([]);
  const [suggestedArticles, setSuggestedArticles] = useState([]);

  const [currentEntryContent, setCurrentEntryContent] = useState('');

  const { userId, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      getEntries(userId)
    }
  }, [isSignedIn])

  const newEntry = async (userId) => {
    if (currentEntry.trim() === '') {
      alert('Please enter a valid entry');
      return;
    } 
    await fetch('http://localhost:8080/api/new_entry', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId, date: new Date().toLocaleString(), entry: currentEntry }),
    })
    .then(response => response.text())
    .then(() => {
      // Call searchEntries to refresh the entries after adding a new one
      searchEntries(userId);
      getEntries(userId);
      setCurrentEntry(''); // Clear the current entry after saving
    })
    .catch((error) => {
        console.error('Error:', error);
    });
  }

  const searchEntries = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/search_entries?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const suggestions = data.results.suggestions[0];

      setExercises(suggestions.exercises)
      console.log(suggestions.exercises);
      setPossibleConditions(suggestions.possible_conditions)
      console.log(suggestions.possible_conditions);
      setSuggestedArticles(suggestions.suggested_articles)
      console.log(suggestions.suggested_articles)


    } catch(error) {
        console.error('Error:', error);
    };
  }

  const getEntries = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/get_entry?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log(data);

      // for (let i=0; i<data.length; i++) {
      //   const entry = data[i];
      //   const newEntry = {
      //     id: i,
      //     date: entry.date,
      //     content: entry.entry,
      //     preview: entry.entry.substring(0, 50) + (entry.entry.length > 50 ? '...' : '')
      //   };
      //   setEntries((prevEntries) => [newEntry, ...prevEntries]);
      // }

      const entries = data.slice().reverse().map((entry, index) => ({
        id: `entry-${index}`,
        date: entry.date,
        content: entry.entry,
        preview: entry.entry.substring(0, 50) + (entry.entry.length > 50 ? '...' : '')
      }))

      // Sort entries by date in descending order
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(entries);



    } catch(error) {
        console.error('Error:', error);
    };
  }

  // Mock recommendations data
  const recommendations = {
    weeklyProgress: {
      exercisesCompleted: 5,
      totalExercises: 7,
      streakDays: 5
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEntry = entries.find(entry => entry.id === selectedEntryId);

  const mockAnalyzeSymptoms = () => {
    setAnalysis({
      possibleConditions,
      suggestedArticles
    });
    setShowAnalysis(true);
    setShowRecommendations(false);
  };

  const RecommendationsPanel = () => (
    <div className="w-80 bg-white border-l">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Daily Recommendations</h2>
      </div>
      <div className="p-4 border-b">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Weekly Progress</span>
            <span className="text-sm text-gray-500">
              {recommendations.weeklyProgress.exercisesCompleted}/{recommendations.weeklyProgress.totalExercises}
            </span>
          </div>
          <Progress value={
            (recommendations.weeklyProgress.exercisesCompleted / 
            recommendations.weeklyProgress.totalExercises) * 100
          } />
        </div>
        <div className="flex justify-between text-sm">
          <span>🔥 {recommendations.weeklyProgress.streakDays} day streak</span>
          <span className="text-gray-500">Keep it up!</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-3">Today's Exercises</h3>
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <Card 
              key={`exercise-${index}`}
              className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedExercise?.id === exercise.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                if (exercise.link) {
                  window.open(exercise.link, '_blank'); // Opens the link in a new tab
                }
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{exercise.title}</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {exercise.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
      {selectedExercise && (
        <div className="p-4 border-t bg-gray-50">
          <h3 className="font-medium mb-3">Exercise Steps</h3>
          <ol className="list-decimal pl-4 space-y-2 text-sm">
            {selectedExercise.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <Button className="w-full mt-4">Mark as Complete</Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="w-64 border-r bg-gray-100 flex flex-col">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-4 py-2 rounded-md bg-gray-200 border-0 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
        {filteredEntries.map((entry, index) => (
            <div
                key={entry.id} 
                onClick={() => {
                    setSelectedEntryId(entry.id); // Set the selected entry
                    setCurrentEntryContent(entry.content); // Set the content of the selected entry
                }}
                className={`p-3 cursor-pointer border-b ${
                    selectedEntryId === index ? 'bg-white' : 'hover:bg-gray-200'
                }`}
            >
                <div className="text-xs text-gray-500">{entry.date}</div>
                <div className="text-sm font-medium truncate">{entry.preview}</div>
            </div>
        ))}
        </div>
        <div className="p-2 border-t">
          <Button
            onClick={() => {
              setSelectedEntryId(null);
              setCurrentEntry('');
              setShowAnalysis(false);
              setShowRecommendations(false);
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </Button>
        </div>
      </div>
      <div className="flex-1 flex">
        <div className={`flex-1 flex flex-col ${showAnalysis || showRecommendations ? 'border-r' : ''}`}>
          <div className="border-b p-2 flex justify-between items-center bg-white">
            <div className="flex gap-2">
              {selectedEntry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEntries(entries.filter(e => e.id !== selectedEntryId));
                    setSelectedEntryId(null);
                    setCurrentEntry('');
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={mockAnalyzeSymptoms}
                  className="flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Analysis
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRecommendations(true);
                    setShowAnalysis(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Recommendations
                </Button>
              </div>
          </div>
          <textarea
            value={selectedEntry ? selectedEntry.content : currentEntry}
            onChange={(e) => {
              if (selectedEntry) {
                const updatedEntries = entries.map(entry =>
                  entry.id === selectedEntry.id
                    ? { ...entry, content: e.target.value, preview: e.target.value.substring(0, 50) + (e.target.value.length > 50 ? '...' : '') }
                    : entry
                );
                setEntries(updatedEntries);
              } else {
                setCurrentEntry(e.target.value);
              }
            }}
            className="flex-1 p-4 resize-none focus:outline-none bg-white"
            placeholder="Describe your symptoms or feelings..."
          />

          <div className={styles.button}>
            <Button onClick={() => newEntry(userId)}>Save Entry</Button> {/* changed onclick from handleSave */}
          </div>

        </div>
        {showAnalysis && (
        <div className="w-80 bg-white">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">AI Analysis</h2>
          </div>
          <div className="p-4">
            <Card className="mb-4 bg-yellow-50 border-yellow-200">
              <div className="p-3 text-sm text-yellow-800">
                This analysis is for informational purposes only. Please consult a healthcare provider for proper diagnosis and treatment.
              </div>
            </Card>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Possible Conditions:</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {analysis?.possibleConditions && analysis.possibleConditions.length > 0 ? (
                  analysis.possibleConditions.map((condition, index) => (
                    <li key={`condition-${index}`}>{condition}</li>
                  ))
                ) : (
                  <li>No possible conditions found.</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Suggested Articles:</h3>
              <ul className="text-sm space-y-2">
                {analysis?.suggestedArticles && analysis.suggestedArticles.length > 0 ? (
                  analysis.suggestedArticles.map((article, index) => (
                    <li key={`article-${index}`}>
                      <a
                        href={article.source} // Ensure you have the url property on each article
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {article.title}
                      </a>
                    </li>
                  ))
                ) : (
                  <li>No suggested articles found.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
        {showRecommendations && <RecommendationsPanel />}
      </div>
    </div>
  );
};

export default MedicalDiary;
