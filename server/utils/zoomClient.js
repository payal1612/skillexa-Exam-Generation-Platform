import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Zoom API Configuration
const ZOOM_API_BASE = 'https://api.zoom.us/v2';
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

// Cache for access token
let accessToken = null;
let tokenExpiry = null;

/**
 * Get Zoom OAuth Access Token (Server-to-Server OAuth)
 */
export const getZoomAccessToken = async () => {
  try {
    // Return cached token if still valid
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return accessToken;
    }

    // Check if credentials are configured
    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      console.warn('Zoom credentials not configured - using mock mode');
      return null;
    }

    const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
      'https://zoom.us/oauth/token',
      new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: ZOOM_ACCOUNT_ID
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    // Token expires in 1 hour, refresh 5 minutes early
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Failed to get Zoom access token:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Create a Zoom Meeting
 */
export const createZoomMeeting = async (meetingDetails) => {
  try {
    const token = await getZoomAccessToken();
    
    // If no token (credentials not configured), return mock meeting
    if (!token) {
      return createMockMeeting(meetingDetails);
    }

    const { topic, startTime, duration, agenda, hostEmail } = meetingDetails;

    const response = await axios.post(
      `${ZOOM_API_BASE}/users/me/meetings`,
      {
        topic: topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: duration || 60,
        timezone: 'UTC',
        agenda: agenda || '',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: true,
          waiting_room: false,
          audio: 'both',
          auto_recording: 'cloud',
          approval_type: 0, // Automatically approve
          registration_type: 1, // Attendees register once and can attend any occurrence
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      meetingId: response.data.id,
      joinUrl: response.data.join_url,
      startUrl: response.data.start_url,
      password: response.data.password,
      hostEmail: response.data.host_email,
      topic: response.data.topic,
      startTime: response.data.start_time,
      duration: response.data.duration
    };
  } catch (error) {
    console.error('Failed to create Zoom meeting:', error.response?.data || error.message);
    // Return mock meeting as fallback
    return createMockMeeting(meetingDetails);
  }
};

/**
 * Create mock meeting (when Zoom is not configured)
 */
const createMockMeeting = (meetingDetails) => {
  const meetingId = Math.floor(Math.random() * 9000000000) + 1000000000;
  const password = Math.random().toString(36).substring(2, 8);
  
  return {
    success: true,
    mock: true,
    meetingId: meetingId.toString(),
    joinUrl: `https://zoom.us/j/${meetingId}?pwd=${password}`,
    startUrl: `https://zoom.us/s/${meetingId}?pwd=${password}`,
    password: password,
    topic: meetingDetails.topic,
    startTime: meetingDetails.startTime,
    duration: meetingDetails.duration || 60,
    message: 'Mock meeting created - Configure Zoom credentials for real meetings'
  };
};

/**
 * Get Meeting Details
 */
export const getZoomMeeting = async (meetingId) => {
  try {
    const token = await getZoomAccessToken();
    
    if (!token) {
      return { success: false, message: 'Zoom not configured' };
    }

    const response = await axios.get(
      `${ZOOM_API_BASE}/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return {
      success: true,
      meeting: response.data
    };
  } catch (error) {
    console.error('Failed to get Zoom meeting:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Delete a Zoom Meeting
 */
export const deleteZoomMeeting = async (meetingId) => {
  try {
    const token = await getZoomAccessToken();
    
    if (!token) {
      return { success: true, message: 'Mock meeting deleted' };
    }

    await axios.delete(
      `${ZOOM_API_BASE}/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to delete Zoom meeting:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Update a Zoom Meeting
 */
export const updateZoomMeeting = async (meetingId, updates) => {
  try {
    const token = await getZoomAccessToken();
    
    if (!token) {
      return { success: true, message: 'Mock meeting updated', mock: true };
    }

    await axios.patch(
      `${ZOOM_API_BASE}/meetings/${meetingId}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to update Zoom meeting:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Create meetings for all live sessions in a roadmap
 */
export const createSessionMeetings = async (liveSessions) => {
  const sessionsWithMeetings = [];

  for (const session of liveSessions) {
    const meetingDetails = {
      topic: session.title,
      startTime: session.scheduledDate,
      duration: parseInt(session.duration) || 60,
      agenda: `${session.topic} - Instructor: ${session.instructor}`
    };

    const meeting = await createZoomMeeting(meetingDetails);

    sessionsWithMeetings.push({
      ...session,
      zoomMeetingId: meeting.meetingId,
      zoomJoinUrl: meeting.joinUrl,
      zoomStartUrl: meeting.startUrl,
      zoomPassword: meeting.password,
      isMockMeeting: meeting.mock || false
    });
  }

  return sessionsWithMeetings;
};

export default {
  getZoomAccessToken,
  createZoomMeeting,
  getZoomMeeting,
  deleteZoomMeeting,
  updateZoomMeeting,
  createSessionMeetings
};
