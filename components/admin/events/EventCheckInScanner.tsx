'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Event } from '@/types/events';
import { QRScanner } from './QRScanner';
import { 
  QrCode, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  Tag,
  Calendar,
  Search,
  Camera
} from 'lucide-react';

interface EventCheckInScannerProps {
  event: Event;
  totalRegistrations: number;
  checkedInCount: number;
}

interface RegistrationData {
  id: string;
  name: string;
  email: string;
  type: string;
  event_id: string;
  event_title: string;
  timestamp: number;
}

interface CheckInResult {
  success: boolean;
  message: string;
  registration?: any;
  alreadyCheckedIn?: boolean;
}

export function EventCheckInScanner({ 
  event, 
  totalRegistrations: initialTotal,
  checkedInCount: initialCheckedIn 
}: EventCheckInScannerProps) {
  const router = useRouter();
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [totalRegistrations, setTotalRegistrations] = useState(initialTotal);
  const [checkedInCount, setCheckedInCount] = useState(initialCheckedIn);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const processingRef = useRef(false);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create success sound
    successAudioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWm98OScTgwOUKzn77RgGwU7k9n0yHYpBSh+zPLaizsKElyx6OyrWBUIQ5zd8sFuJAUuhM/z2Ik2CBdqvfDjm04LDlGs5++zYBoFPJPZ9Mh2KQUofszy2os7ChJcsevsq1gVCEOc3fLBbiQFLoTP89iJNggXar3w45tOCw5RrOfvs2AaBTyT2fTIdikFKH7M8tqLOwsSXLHr7KtYFQhDnN3ywW4kBS6Ez/PYiTYIF2q98OObTgsOUazn77NgGgU8k9n0yHYpBSh+zPLaizsKElyx6+yrWBUIQ5zd8sFuJAUuhM/z2Ik2CBdqvfDjm04LDlGs5++zYBoFPJPZ9Mh2KQUofszy2os7ChJcsevsq1gVCEOc3fLBbiQFLoTP89iJNggXar3w45tOCw5RrOfvs2AaBTyT2fTIdikFKH7M8tqLOwsSXLHr7KtYFQhDnN3ywW4kBS6Ez/PYiTYIF2q98OObTgsOUazn77NgGgU8k9n0yHYpBSh+zPLaizsKElyx6+yrWBUIQ5zd8sFuJAUuhM/z2Ik2CBdqvfDjm04LDlGs5++zYBoFPJPZ9Mh2KQUofszy2os7ChJcsevsq1gVCEOc3fLBbiQFLoTP89iJNggXar3w45tOCw5RrOfvs2AaBTyT2fTIdikFKH7M8tqLOwsSXLHr7KtYFQhDnN3ywW4kBS6Ez/PYiTYIF2q98OObTgsOUazn77NgGgU8k9n0yHYpBSh+zPLaizsKElyx6+yrWBUIQ5zd8sFuJAUuhM/z2Ik2CBdqvfDjm04LDlGs5++zYBoFPJPZ9Mh2KQUofszy2os7ChJcsevsq1gVCEOc3fLBbiQFLoTP8w==');
    
    // Create error sound
    errorAudioRef.current = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
  }, []);

  const handleCheckIn = async (qrData: string) => {
    // Prevent duplicate check-ins
    if (processingRef.current) {
      setErrorMessage('Already processing a check-in, ignoring duplicate scan');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      if (errorAudioRef.current) {
        errorAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      console.log('Already processing a check-in, ignoring duplicate scan');
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setResult(null);

    try {
      // Parse QR data
      let registrationData: RegistrationData;
      try {
        registrationData = JSON.parse(qrData);
        console.log('Parsed QR data:', registrationData);
      } catch (parseError) {
        console.error('QR parse error:', parseError);
        throw new Error('Invalid QR code format');
      }

      // Verify event matches
      console.log('Checking event match:', { qrEventId: registrationData.event_id, currentEventId: event.id });
      if (registrationData.event_id !== event.id) {
        throw new Error(`This QR code is for "${registrationData.event_title}" event, not this event`);
      }

      // Call check-in API
      const response = await fetch(`/api/admin/events/${event.id}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registrationData.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-in failed');
      }

      setResult({
        success: true,
        message: data.alreadyCheckedIn 
          ? 'Already checked in' 
          : 'Check-in successful!',
        registration: data.registration,
        alreadyCheckedIn: data.alreadyCheckedIn,
      });

      if (!data.alreadyCheckedIn) {
        setCheckedInCount(prev => prev + 1);
        setRecentCheckIns(prev => [data.registration, ...prev.slice(0, 4)]);
        
        // Show success popup
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
        
        // Play success sound
        if (successAudioRef.current) {
          successAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
      } else {
        // Already checked in - show error popup
        setErrorMessage('This attendee has already been checked in');
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 3000);
        
        // Play error sound
        if (errorAudioRef.current) {
          errorAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
      }

      // Clear input after successful check-in
      setManualInput('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Check-in failed';
      
      setResult({
        success: false,
        message: errorMsg,
      });
      
      // Show error popup
      setErrorMessage(errorMsg);
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      
      // Play error sound
      if (errorAudioRef.current) {
        errorAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const handleManualCheckIn = () => {
    if (!manualInput.trim()) return;
    handleCheckIn(manualInput);
  };

  const handleSearchByEmail = async () => {
    if (!manualInput.trim()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/check-in?email=${encodeURIComponent(manualInput)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration not found');
      }

      // Auto check-in if found
      await handleCheckIn(data.qrCodeData);
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Search failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const percentage = totalRegistrations > 0 
    ? Math.round((checkedInCount / totalRegistrations) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/admin/pages/events/${event.id}/registrations`)}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registrations
          </Button>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">QR Code Check-in Scanner</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Registrations</p>
              <p className="text-4xl font-bold">{totalRegistrations}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Checked In</p>
              <p className="text-4xl font-bold text-green-600">{checkedInCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Check-in Rate</p>
              <p className="text-4xl font-bold text-blue-600">{percentage}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{checkedInCount} / {totalRegistrations}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          onClick={() => setScanMode('camera')}
          variant={scanMode === 'camera' ? 'default' : 'outline'}
          className={scanMode === 'camera' ? 'bg-[#009688] hover:bg-[#00796b]' : ''}
        >
          <Camera className="w-4 h-4 mr-2" />
          Camera Scanner
        </Button>
        <Button
          onClick={() => setScanMode('manual')}
          variant={scanMode === 'manual' ? 'default' : 'outline'}
          className={scanMode === 'manual' ? 'bg-[#009688] hover:bg-[#00796b]' : ''}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Manual Input
        </Button>
      </div>

      {/* Camera Scanner */}
      {scanMode === 'camera' && (
        <QRScanner onScan={handleCheckIn} isProcessing={isProcessing} />
      )}

      {/* Manual Input */}
      {scanMode === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Check-in</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Paste QR code data or enter attendee email address
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="QR code data or email address..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (manualInput.includes('@')) {
                      handleSearchByEmail();
                    } else {
                      handleManualCheckIn();
                    }
                  }
                }}
                disabled={isProcessing}
              />
              <Button
                onClick={manualInput.includes('@') ? handleSearchByEmail : handleManualCheckIn}
                disabled={isProcessing || !manualInput.trim()}
              >
                {manualInput.includes('@') ? (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <p className="font-semibold mb-2">{result.message}</p>
                    {result.registration && (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{result.registration.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{result.registration.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          <span>{result.registration.participation_type.replace(/_/g, ' ')}</span>
                        </div>
                        {result.registration.checked_in_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Checked in: {new Date(result.registration.checked_in_at).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
        </Card>
      )}

      {/* Recent Check-ins */}
      {recentCheckIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCheckIns.map((reg, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{reg.full_name}</p>
                    <p className="text-sm text-muted-foreground">{reg.email}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">How to use:</h3>
          {scanMode === 'camera' ? (
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Click "Start Camera Scanner" to activate your device camera</li>
              <li>• Point camera at attendee's QR code</li>
              <li>• Hold steady until it beeps and auto-checks in</li>
              <li>• Ready for next scan after 2 seconds</li>
              <li>• Switch to "Manual Input" if camera doesn't work</li>
            </ul>
          ) : (
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Paste QR code data in the input field</li>
              <li>• Or enter attendee's email address to search</li>
              <li>• Press Enter or click the button to process</li>
              <li>• Switch to "Camera Scanner" for faster check-ins</li>
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-6 rounded-lg shadow-2xl animate-bounce">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-12 h-12" />
              <div>
                <p className="text-2xl font-bold">✓ Check-in Successful!</p>
                <p className="text-green-100">Attendee has been checked in</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-red-500 text-white px-8 py-6 rounded-lg shadow-2xl animate-pulse">
            <div className="flex items-center gap-4">
              <XCircle className="w-12 h-12" />
              <div>
                <p className="text-2xl font-bold">✗ Check-in Failed!</p>
                <p className="text-red-100">{errorMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
