import React, { useState } from 'react';
import { Coordinates, HelpRequest, UrgencyLevel } from '../types';
import { analyzeHelpRequest } from '../services/geminiService';
import { Loader2, MapPin, Send } from 'lucide-react';

interface RequestFormProps {
  location: Coordinates | null;
  onSubmit: (req: HelpRequest) => void;
  onCancel: () => void;
  onRequestLocation: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ 
  location, 
  onSubmit, 
  onCancel,
  onRequestLocation 
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;

    setIsSubmitting(true);

    try {
      // AI Processing
      const analysis = await analyzeHelpRequest(details);

      // Safe ID generation for environments where crypto.randomUUID is not available (e.g. non-HTTPS)
      const generateId = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          return crypto.randomUUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
      };

      const newRequest: HelpRequest = {
        id: generateId(),
        name,
        phone,
        details,
        location,
        timestamp: Date.now(),
        urgency: analysis.urgency,
        tags: analysis.tags
      };

      onSubmit(newRequest);
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-t-xl md:rounded-xl shadow-2xl w-full max-w-md mx-auto pointer-events-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Request Help / ขอความช่วยเหลือ</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-700">Close</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name / ชื่อ-สกุล</label>
          <input
            required
            type="text"
            className="mt-1 block w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Phone / เบอร์โทรศัพท์</label>
          <input
            required
            type="tel"
            className="mt-1 block w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Situation & Needs / สิ่งที่ต้องการ</label>
          <textarea
            required
            rows={3}
            placeholder="e.g. Water level 1m, need food and medicine"
            className="mt-1 block w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1">AI will detect urgency automatically.</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <label className="block text-sm font-medium text-blue-800 mb-2">Location / ตำแหน่ง</label>
          {location ? (
            <div className="flex items-center text-green-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Pinned: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
            </div>
          ) : (
             <div className="flex items-center text-amber-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Please click on the map or use GPS</span>
            </div>
          )}
          
          <button
            type="button"
            onClick={onRequestLocation}
            className="mt-2 text-xs bg-white border border-blue-300 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 flex items-center"
          >
            <MapPin className="w-3 h-3 mr-1" /> Use Current GPS
          </button>
        </div>

        <button
          type="submit"
          disabled={!location || isSubmitting}
          className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium ${
            !location || isSubmitting 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing & Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Request
            </>
          )}
        </button>
      </form>
    </div>
  );
};