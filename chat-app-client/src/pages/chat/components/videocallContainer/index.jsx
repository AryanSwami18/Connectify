import { useSocket } from '@/context/socketContext';
import { useAppStore } from '@/store';
import { getColor } from '@/utils/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const VideoCall = () => {
  const socket = useSocket();
  const {
    userInfo,
    activeVideoCallParticipant,
    incomingVideoCallOffer,
    videoCallStatus,
    setVideoCallState,
    resetVideoCall,
  } = useAppStore();

  const [hasPermission, setHasPermission] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [isLocalStreamReady, setIsLocalStreamReady] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const hasStartedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const pendingCandidatesRef = useRef([]);

  const participantName =
    activeVideoCallParticipant?.displayName || activeVideoCallParticipant?.email || 'Unknown user';

  const cleanupMedia = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    pendingCandidatesRef.current = [];
    hasStartedRef.current = false;
    setIsLocalStreamReady(false);
    setHasRemoteStream(false);
  }, []);

  const finishCall = useCallback(({ notifyRemote = true } = {}) => {
    if (hasEndedRef.current) {
      return;
    }

    hasEndedRef.current = true;

    if (notifyRemote && socket && activeVideoCallParticipant?._id) {
      socket.emit('end-call', {
        to: activeVideoCallParticipant._id,
        from: userInfo._id,
      });
    }

    cleanupMedia();
    resetVideoCall();
  }, [activeVideoCallParticipant, cleanupMedia, resetVideoCall, socket, userInfo]);

  const ensurePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const peerConnection = new RTCPeerConnection(iceServers);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket && activeVideoCallParticipant?._id) {
        socket.emit('ice-candidate', {
          to: activeVideoCallParticipant._id,
          from: userInfo._id,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;
      setHasRemoteStream(true);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      if (state === 'connected') {
        setVideoCallState({ videoCallStatus: 'connected' });
      }

      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        finishCall({ notifyRemote: state !== 'closed' });
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [activeVideoCallParticipant, finishCall, setVideoCallState, socket, userInfo]);

  const flushPendingCandidates = useCallback(async () => {
    if (!peerConnectionRef.current?.remoteDescription) {
      return;
    }

    while (pendingCandidatesRef.current.length) {
      const candidate = pendingCandidatesRef.current.shift();
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        setIsLocalStreamReady(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setHasPermission(false);
        toast.error('Camera or microphone access was blocked');
        finishCall({ notifyRemote: true });
      }
    };

    getMediaStream();

    return () => {
      isMounted = false;
      cleanupMedia();
    };
  }, [finishCall, cleanupMedia]);

  useEffect(() => {
    if (!socket || !isLocalStreamReady || !activeVideoCallParticipant?._id || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    hasEndedRef.current = false;

    const startCall = async () => {
      try {
        const peerConnection = ensurePeerConnection();

        if (incomingVideoCallOffer) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingVideoCallOffer));
          await flushPendingCandidates();
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socket.emit('answer-call', {
            to: activeVideoCallParticipant._id,
            from: userInfo._id,
            answer,
          });

          setVideoCallState({
            incomingVideoCallOffer: undefined,
            videoCallStatus: 'connecting',
          });
          return;
        }

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('call-user', {
          to: activeVideoCallParticipant._id,
          from: userInfo._id,
          fromUser: {
            _id: userInfo._id,
            displayName: userInfo.displayName,
            email: userInfo.email,
            image: userInfo.image,
            color: userInfo.color,
          },
          offer,
        });
      } catch (error) {
        console.error('Error starting video call:', error);
        toast.error('Unable to start the call');
        finishCall({ notifyRemote: true });
      }
    };

    startCall();
  }, [socket, isLocalStreamReady, activeVideoCallParticipant, incomingVideoCallOffer, userInfo, setVideoCallState, ensurePeerConnection, finishCall, flushPendingCandidates]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleCallAnswered = async ({ answer }) => {
      try {
        const peerConnection = ensurePeerConnection();
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        await flushPendingCandidates();
        setVideoCallState({ videoCallStatus: 'connecting' });
      } catch (error) {
        console.error('Error applying remote answer:', error);
        toast.error('Unable to connect the call');
        finishCall({ notifyRemote: true });
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        if (!candidate) {
          return;
        }

        const peerConnection = ensurePeerConnection();
        if (peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          return;
        }

        pendingCandidatesRef.current.push(candidate);
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    };

    const handleRemoteEnd = () => {
      toast.info('The call has ended');
      finishCall({ notifyRemote: false });
    };

    const handleRemoteDecline = () => {
      toast.error('The call was declined');
      finishCall({ notifyRemote: false });
    };

    socket.on('call-answered', handleCallAnswered);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-ended', handleRemoteEnd);
    socket.on('call-declined', handleRemoteDecline);

    return () => {
      socket.off('call-answered', handleCallAnswered);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('call-ended', handleRemoteEnd);
      socket.off('call-declined', handleRemoteDecline);
    };
  }, [socket, activeVideoCallParticipant, userInfo, setVideoCallState, ensurePeerConnection, finishCall, flushPendingCandidates]);

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()?.[0];
    if (!audioTrack) {
      return;
    }

    audioTrack.enabled = !audioTrack.enabled;
    setIsMicMuted(!audioTrack.enabled);
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()?.[0];
    if (!videoTrack) {
      return;
    }

    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraMuted(!videoTrack.enabled);
  };

  if (!hasPermission) {
    return (
      <div className='flex h-full w-full items-center justify-center bg-[#16151f] px-6 text-center'>
        <div>
          <h2 className='text-2xl font-semibold'>Camera or microphone access is required</h2>
          <p className='mt-2 text-neutral-400'>
            Allow permissions in the browser, then try the call again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full flex-col bg-[#0f0f17] text-white'>
      <div className='flex items-center justify-between border-b border-white/10 px-6 py-4'>
        <div>
          <p className='text-xs uppercase tracking-[0.25em] text-cyan-300'>Video call</p>
          <h1 className='mt-1 text-2xl font-semibold'>{participantName}</h1>
          <p className='mt-1 text-sm text-neutral-400 capitalize'>
            {videoCallStatus === 'connected' ? 'Connected' : videoCallStatus}
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getColor(activeVideoCallParticipant?.color)}`}>
            {(activeVideoCallParticipant?.displayName || activeVideoCallParticipant?.email || '?').charAt(0)}
          </div>
        </div>
      </div>

      <div className='grid flex-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='relative overflow-hidden rounded-3xl border border-white/10 bg-[#191826]'>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className='h-full w-full object-cover'
          />

          {!hasRemoteStream && (
            <div className='absolute inset-0 flex flex-col items-center justify-center bg-[#191826] text-center'>
              <div className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl ${getColor(activeVideoCallParticipant?.color)}`}>
                {(activeVideoCallParticipant?.displayName || activeVideoCallParticipant?.email || '?').charAt(0)}
              </div>
              <p className='mt-5 text-xl font-medium'>{participantName}</p>
              <p className='mt-2 text-sm text-neutral-400'>
                {videoCallStatus === 'calling' ? 'Ringing...' : 'Connecting video...'}
              </p>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-4'>
          <div className='relative min-h-[240px] overflow-hidden rounded-3xl border border-white/10 bg-[#191826]'>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className='h-full w-full object-cover'
            />
            <div className='absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white'>
              You
            </div>
          </div>

          <div className='rounded-3xl border border-white/10 bg-[#191826] p-4'>
            <div className='flex gap-3'>
              <button
                onClick={toggleMic}
                className={`flex-1 rounded-2xl px-4 py-3 font-medium transition ${
                  isMicMuted ? 'bg-neutral-600 hover:bg-neutral-500' : 'bg-sky-500 text-black hover:bg-sky-400'
                }`}
              >
                {isMicMuted ? 'Unmute mic' : 'Mute mic'}
              </button>

              <button
                onClick={toggleCamera}
                className={`flex-1 rounded-2xl px-4 py-3 font-medium transition ${
                  isCameraMuted ? 'bg-neutral-600 hover:bg-neutral-500' : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                {isCameraMuted ? 'Turn camera on' : 'Turn camera off'}
              </button>
            </div>

            <button
              onClick={() => finishCall({ notifyRemote: true })}
              className='mt-3 w-full rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-400'
            >
              End call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
