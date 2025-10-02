import { useState, useEffect } from 'react';
import { SubjectApi } from '@/lib/endpoints';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Send, Bot, User, BookOpen, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ChatSubjectPage() {
  const [searchParams] = useSearchParams();
  const [subjectId, setSubjectId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);

  // Get subjectId from URL parameters
  useEffect(() => {
    const urlSubjectId = searchParams.get('subjectId');
    if (urlSubjectId) {
      setSubjectId(urlSubjectId);
    }
  }, [searchParams]);

  const handleSend = async () => {
    if (!subjectId || !prompt.trim()) {
      setError('Please enter both Subject ID and your question');
      return;
    }

    setError('');
    
    // Add user message to chat history
    const userMessage = {
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt(''); // Clear input immediately

    try {
      setLoading(true);
      const res = await SubjectApi.chat({ 
        subjectId: Number(subjectId), 
        prompt: currentPrompt 
      });
      
      if (res.data.success) {
        // Add AI response to chat history
        const aiMessage = {
          type: 'ai',
          content: res.data.data.response,
          timestamp: new Date(),
          subjectName: res.data.data.subjectName
        };
        
        setChatHistory(prev => [...prev, aiMessage]);
        setCurrentSubject({
          id: res.data.data.subjectId,
          name: res.data.data.subjectName
        });
      } else {
        setError(res.data.message || 'Failed to get response');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to chat');
      // Remove the user message if request failed
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          {currentSubject && (
            <Badge className="bg-purple-700 hover:bg-purple-800">
              <BookOpen className="w-4 h-4 mr-1" />
              {currentSubject.name} (ID: {currentSubject.id})
            </Badge>
          )}
        </div>

        <Card className="bg-gray-800 border border-purple-700 rounded-xl shadow-2xl shadow-purple-900/40">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold text-purple-400">Subject Chat Assistant</h1>
            </div>
            <p className="text-purple-300 text-sm">Ask questions about your subject materials</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Subject ID Input */}
            <div className="space-y-2">
              <label className="text-purple-300 font-medium">Subject ID</label>
              <Input
                placeholder="Enter Subject ID (e.g., 1)"
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className="bg-gray-700 border-purple-600 text-white placeholder-purple-400"
              />
            </div>

            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto bg-gray-700 p-4 rounded-lg">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' ? 'bg-purple-600' : 'bg-green-600'
                      }`}>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-600 text-white'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-600 text-white p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input Area */}
            <div className="space-y-3">
              <Textarea
                placeholder="Ask a question about the subject..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="bg-gray-700 border-purple-600 text-white placeholder-purple-400 min-h-[100px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !subjectId || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Alert className="bg-red-900 border-red-700">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


