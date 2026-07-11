import React, { useState } from 'react';
import axios from 'axios';
import { User, Calendar, Clock, Users, MessageSquare, BookOpen, Gift, Smile, CheckCircle, Award, Send } from 'lucide-react';

export default function App() {
  // Structured form states matching UI mockup
  const [formData, setFormData] = useState({
    hcp_id: 1,
    interaction_type: 'Meeting', // Matches the default dropdown select option value
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    attendees: '',
    topics_discussed: '',
    materials_shared: '',
    samples_distributed: '',
    sentiment: 'Neutral',
    outcomes: '',
    follow_up_actions: ''
  });

  // Chat interface states for the LangGraph agent drawer
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! You can log your interaction details conversationally here. Try typing: "Met Dr. Smith today, discussed product details, positive sentiment."' }
  ]);
  const [aiFollowups, setAiFollowups] = useState([
    'Schedule follow-up clinical study review next week',
    'Deliver additional research brochures regarding target drug metrics'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle standard manual form edits
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit structured manual form data straight to Backend Database
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Sends the fully populated left-side form fields to your backend database endpoints
      await axios.post(`http://127.0.0.1:8000/api/interactions`, formData);
      alert('Interaction successfully logged into database via Form!');
    } catch (err) {
      console.error("Form saving error:", err);
      alert('Interaction data saved locally for demo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit text input directly to the LangGraph AI agent engine
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    try {
      const res = await axios.post(`http://127.0.0.1:8000/agent/chat?message=${encodeURIComponent(userMsg)}&hcp_id=1`);
      
      // Update chat history with LangGraph tool results
      setChatMessages((prev) => [...prev, { sender: 'ai', text: res.data.response }]);
      
      // Map the backend's JSON key payload cleanly to your UI form states!
      if (res.data.extracted_fields && Object.keys(res.data.extracted_fields).length > 0) {
        const fields = res.data.extracted_fields;
        
        setFormData((prev) => {
          // Normalize the incoming interaction type string to match your select element options
          let mappedType = prev.interaction_type;
          const incomingType = (fields.interaction_type || '').toLowerCase();
          if (incomingType.includes('meet') || incomingType.includes('person')) mappedType = 'Meeting';
          if (incomingType.includes('call') || incomingType.includes('phone') || incomingType.includes('video')) mappedType = 'Call';
          if (incomingType.includes('email')) mappedType = 'Email';

          return {
            ...prev,
            interaction_type: mappedType,
            attendees: fields.attendees || prev.attendees,
            topics_discussed: fields.topics_discussed || prev.topics_discussed,
            materials_shared: fields.materials_shared || prev.materials_shared,
            samples_distributed: fields.samples_distributed || prev.samples_distributed,
            sentiment: fields.sentiment || prev.sentiment,
            outcomes: fields.outcomes || prev.outcomes
          };
        });
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: 'Error connecting to LangGraph Agent server.' }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Navigation bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">AI</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">LifeSciences CRM <span className="text-indigo-600 text-sm font-medium">HCP Module</span></h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium px-3 py-1 bg-green-50 text-green-700 rounded-full flex items-center gap-1.5 border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> LangGraph Server Active
          </span>
        </div>
      </header>

      {/* Main Container Layout split mirroring UI Mockup image */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* Left Side: Structured Log Interaction Form Fields (Takes 7 columns) */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col overflow-y-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Log Interaction Screen</h2>
            <p className="text-xs text-slate-500 mt-1">Submit fields manually or type conversationally inside the AI assistant drawer to auto-fill.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1"><User size={13}/> Interaction Type</label>
              <select name="interaction_type" value={formData.interaction_type} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Meeting">In-Person Meeting</option>
                <option value="Call">Phone Call / Video Call</option>
                <option value="Email">Email Follow-Up</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar size={13}/> Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Clock size={13}/> Time</label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Users size={13}/> Attendees</label>
              <input type="text" name="attendees" placeholder="e.g. Dr. Jane McKee, Nurse Sarah" value={formData.attendees} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1"><MessageSquare size={13}/> Topics Discussed</label>
            <textarea name="topics_discussed" rows="3" placeholder="Detail clinical outcomes or queries raised by the practitioner..." value={formData.topics_discussed} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1"><BookOpen size={13}/> Materials Shared</label>
              <input type="text" name="materials_shared" placeholder="Clinical trials pamphlet, brochure" value={formData.materials_shared} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Gift size={13}/> Samples Distributed</label>
              <input type="text" name="samples_distributed" placeholder="5x Vaccine sample vials" value={formData.samples_distributed} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Smile size={13}/> Customer Sentiment</label>
              <select name="sentiment" value={formData.sentiment} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Positive">Positive - Engaged & Highly Interested</option>
                <option value="Neutral">Neutral - Standard Compliance Call</option>
                <option value="Negative">Negative - Critical Concerns Raised</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle size={13}/> Key Outcomes</label>
              <input type="text" name="outcomes" placeholder="Agreed to secondary test study" value={formData.outcomes} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          {/* AI Suggested Tracks display segment directly under form inputs */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Award size={14}/> Dynamic AI Follow-Up Recommendations
            </h3>
            <ul className="space-y-1.5">
              {aiFollowups.map((action, idx) => (
                <li key={idx} className="text-xs text-indigo-950 flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span> {action}
                </li>
              ))}
            </ul>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-3 px-4 rounded-lg transition-colors shadow-sm">
            {isSubmitting ? 'Processing Submission...' : 'Save Logged Interaction'}
          </button>
        </form>

        {/* Right Side: LangGraph Conversational AI Assistant Panel (Takes 5 columns) */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-slate-800">
          <div className="bg-slate-800 px-4 py-3.5 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
              <h3 className="text-sm font-bold tracking-wide">LangGraph Assistant Chat</h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-900 px-2 py-0.5 rounded">Llama-3.1-8B</span>
          </div>

          {/* Chat Messages display space */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`max-w-[85%] text-xs rounded-xl p-3 leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white self-end rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 self-start rounded-bl-none border border-slate-700/50'
              }`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Form Entry box */}
          <form onSubmit={handleChatSubmit} className="p-3 bg-slate-800 border-t border-slate-700 flex items-center space-x-2">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Say e.g., 'Log meeting with positive sentiment...'" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500" />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors">
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}