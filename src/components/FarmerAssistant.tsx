import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Wrench
} from 'lucide-react';
import { askFarmerAssistant } from '../services/gemini';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  usedTools?: string[];
  timestamp: string;
}

export const FarmerAssistant: React.FC = () => {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    language,
    selectedState,
    selectedDistrict,
    season,
    t
  } = useApp();

  const getWelcomeText = () => {
    switch (language) {
      case 'mr':
        return `रामराम! मी आपला शेतकरी मित्र आहे. ${selectedDistrict.name}, ${selectedState.name} साठी आजचे हवामान, पेरणी, कीड फवारणी किंवा आजच्या बाजारभावाबद्दल काहीही विचारा!`;
      case 'hi':
        return `नमस्ते किसान भाई! मैं आपका किसान मित्र हूँ। ${selectedDistrict.name}, ${selectedState.name} के लिए आज का मौसम, बुवाई, दवा छिड़काव या मंडी भाव के बारे में कुछ भी पूछें!`;
      case 'ta':
        return `வணக்கம்! நான் உங்கள் கிசான் மித்ரா. ${selectedDistrict.name}, ${selectedState.name} பகுதிக்கான வானிலை, விதைப்பு அல்லது சந்தை விலை பற்றி கேளுங்கள்!`;
      case 'te':
        return `నమస్కారం! నేను మీ కిసాన్ మిత్ర. ${selectedDistrict.name}, ${selectedState.name} కోసం వాతావరణం, విత్తనాలు లేదా మార్కెట్ ధరల గురించి అడగండి!`;
      case 'kn':
        return `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ರೈತ ಮಿತ್ರ. ${selectedDistrict.name}, ${selectedState.name} ಗಾಗಿ ಹವಾಮಾನ, ಬಿತ್ತನೆ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ದರದ ಬಗ್ಗೆ ಕೇಳಿ!`;
      case 'bn':
        return `নমস্কার! আমি আপনার কৃষক বন্ধু। ${selectedDistrict.name}, ${selectedState.name}-এর আবহাওয়া, বীজ বপন বা বাজার দর সম্পর্কে জানুন!`;
      case 'gu':
        return `નમસ્તે ખેડૂત મિત્ર! હું તમારો કિસાન મિત્ર છું. ${selectedDistrict.name}, ${selectedState.name} માટે હવામાન, વાવણી કે બજાર ભાવ વિશે પૂછો!`;
      default:
        return `Namaste! I am Kisan Mitra, your agricultural helper for ${selectedDistrict.name}, ${selectedState.name}. Ask me about weather, sowing, pest spray, or mandi prices!`;
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: getWelcomeText(),
      usedTools: ['weather'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update welcome message on language or district switch
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: getWelcomeText(),
        usedTools: ['weather'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language, selectedDistrict.name]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const currentLangMeta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech API Voice Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLangMeta.speechCode;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, currentLangMeta.speechCode]);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = currentLangMeta.speechCode;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Mic start error:", err);
      }
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLangMeta.speechCode;
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (messageToSend?: string) => {
    const query = (messageToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await askFarmerAssistant(
        history,
        query,
        {
          state: selectedState.name,
          district: selectedDistrict.name,
          lat: selectedDistrict.lat,
          lon: selectedDistrict.lon,
          season: season.name,
          language
        }
      );

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.answer,
        usedTools: response.usedTools,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (isListening) {
        speakText(response.answer);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `माहिती मिळवण्यात अडचण आली. कृपया पुन्हा विचारून पहा.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAssistantOpen) return null;

  const getQuickPrompts = () => {
    switch (language) {
      case 'mr':
        return [
          "आज फवारणीसाठी योग्य दिवस आहे का?",
          `${selectedDistrict.name} साठी कोणती पिके योग्य आहेत?`,
          "आजचा बाजार भाव काय आहे?",
          "हवामान कसे राहील?"
        ];
      case 'hi':
        return [
          "क्या आज दवा छिड़काव का सही दिन है?",
          `${selectedDistrict.name} के लिए कौन सी फसल सही है?`,
          "आज का मंडी भाव क्या है?",
          "मौसम का हाल कैसा रहेगा?"
        ];
      case 'ta':
        return [
          "இன்று பூச்சிக்கொல்லி தெளிக்க உகந்த நாளா?",
          `${selectedDistrict.name} பகுதிக்கு உகந்த பயிர்கள் எவை?`,
          "இன்றைய சந்தை விலை என்ன?"
        ];
      case 'te':
        return [
          "ఈ రోజు మందు పిచికారీకి అనుకూలమా?",
          `${selectedDistrict.name} కోసం అనువైన పంటలు ఏవి?`,
          "నేటి మార్కెట్ ధర ఎంత?"
        ];
      case 'kn':
        return [
          "ಇಂದು ಔಷಧ ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತವೇ?",
          `${selectedDistrict.name} ಗೆ ಸೂಕ್ತ ಬೆಳೆಗಳು ಯಾವುವು?`,
          "ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರ ಎಷ್ಟು?"
        ];
      default:
        return [
          "Is today good for spraying pesticide?",
          `What are top crops for ${selectedDistrict.name}?`,
          "What is the current Mandi price?",
          "What is the upcoming rain forecast?"
        ];
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col h-[520px] max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight leading-tight">
              {t('kisanMitra')}
            </h3>
            <p className="text-[11px] text-emerald-200">
              {selectedDistrict.name}, {selectedState.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            setIsAssistantOpen(false);
          }}
          className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-stone-50 text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                    : 'bg-white text-stone-800 rounded-bl-xs border border-stone-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                
                {/* Speech Button for Assistant Responses */}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <button
                      onClick={() => speakText(m.text)}
                      className="flex items-center gap-1 hover:text-emerald-700 transition font-medium"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                          <span>थांबवा (Stop)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ऐका (Listen)</span>
                        </>
                      )}
                    </button>
                    <span>{m.timestamp}</span>
                  </div>
                )}
              </div>

              {!isUser && m.usedTools && m.usedTools.length > 0 && (
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-stone-400">
                  <Wrench className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{t('usedTools')}: {m.usedTools.join(', ')}</span>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-stone-200 w-fit text-xs text-stone-500 shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>{t('analyzingAi')}</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-2 bg-stone-100 border-t border-stone-200 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        {getQuickPrompts().map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-[11px] text-stone-700 hover:text-emerald-800 border border-stone-200 whitespace-nowrap transition shadow-xs font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box & Voice Controls */}
      <div className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2">
        <button
          onClick={toggleListen}
          className={`p-2 rounded-xl transition ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
          title={isListening ? "Listening..." : "Speak"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? t('speakNow') : t('typePlaceholder')}
          className="flex-1 px-3 py-2 bg-stone-100 rounded-xl text-xs sm:text-sm border-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
