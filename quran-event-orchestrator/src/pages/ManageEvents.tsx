import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Clock, Plus, Edit, Trash2, X, CheckCircle, XCircle, AlertCircle, Eye, Share2, FileText, ArrowUpDown, ArrowUp, ArrowDown, Music, Shirt, Upload, Download, MapPin, Users, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiGet, apiPost, apiPatch, apiDelete, apiDownloadFile, apiUploadFile } from '@/utils/api';
import { UniversalShare } from '@/components/UniversalShare';

// Types
interface Event {
  id: string;
  day: string;
  date: string;
  time: string;
  duration: number;
  place: string;
  number_of_participants: number;
  status: string;
  created_at: string;
  updated_at: string;
  meeting_time?: string;
  meeting_date?: string;
  place_of_meeting?: string;
  vehicle?: string;
  camera_man?: string;
  participation_type?: string;
  event_reason?: string;
  songs?: Array<{id: number; title: string; artist?: string; duration?: number; order: number; created_at: string}>;
  dress_details?: Array<{id: number; description: string; order: number; created_at: string}>;
  participants?: Array<{id: number; user: string; user_id: number; user_name: string; joined_at: string; is_confirmed: boolean}>;
}

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  permissions?: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ManageEvents() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [fetchingEvents, setFetchingEvents] = useState(true);
  const [fetchingProfiles, setFetchingProfiles] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [viewEventOpen, setViewEventOpen] = useState(false);
  const [bulkShareOpen, setBulkShareOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [eventToComplete, setEventToComplete] = useState<string | null>(null);
  const [eventToCancel, setEventToCancel] = useState<string | null>(null);
  const [eventToView, setEventToView] = useState<Event | null>(null);
  const [selectedEventsForShare, setSelectedEventsForShare] = useState<string[]>([]);
  const [songsDialogOpen, setSongsDialogOpen] = useState(false);
  const [dressDialogOpen, setDressDialogOpen] = useState(false);
  const [eventForDetails, setEventForDetails] = useState<Event | null>(null);
  const [participantsEvent, setParticipantsEvent] = useState<Event | null>(null);
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    day: '',
    date: '',
    time: '',
    place: '',
    participation_type: '',
    event_reason: '',
    status: 'all',
    meeting_date: '',
    meeting_time: '',
    meeting_place: '',
    vehicle: '',
    camera_man: '',
    duration: '',
    number_of_participants: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null
  });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [eventForm, setEventForm] = useState({
    day: '',
    date: '',
    time: '',
    duration: '',
    place: '',
    number_of_participants: '',
    meeting_time: '',
    meeting_date: '',
    place_of_meeting: '',
    vehicle: '',
    camera_man: '',
    participation_type: '',
    event_reason: '',
    songs_used: [''],
    dress_details: {
      pants: '',
      shirt: '',
      coat: '',
      shoes: '',
      whip: '',
      socks: '',
      accessories: ''
    },
    participants: [],
  });

  useEffect(() => {
    fetchEvents();
    fetchProfiles();
  }, []);


  const fetchEvents = async () => {
    try {
      // Fetch all pages to ensure all events are displayed
      let aggregated: Event[] = [];
      let nextUrl: string | null = '/events/';

      while (nextUrl) {
        // Normalize absolute URLs from API pagination to relative paths for our api helper
        let requestUrl = nextUrl;
        if (/^https?:\/\//i.test(nextUrl)) {
          try {
            const u = new URL(nextUrl);
            requestUrl = `${u.pathname}${u.search}` || '/events/';
          } catch (_) {
            requestUrl = '/events/';
          }
        }

        const response = await apiGet(requestUrl);
        if (response.error) {
          throw new Error(response.error);
        }
        const data = response.data;

        // Guard for unexpected HTML (e.g., 301/302 to index.html or error pages)
        if (typeof data === 'string' && /^\s*<!doctype/i.test(data)) {
          throw new Error('Unexpected HTML response while fetching events');
        }

        if (data && Array.isArray(data.results)) {
          aggregated = aggregated.concat(data.results);
          nextUrl = data.next || null;
        } else if (Array.isArray(data)) {
          aggregated = aggregated.concat(data);
          nextUrl = null;
        } else {
          console.error('Expected array or paginated response but got:', typeof data, data);
          nextUrl = null;
        }
      }

      setEvents(aggregated);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
      setEvents([]);
    } finally {
      setFetchingEvents(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      setFetchingProfiles(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        return;
      }

      const response = await apiGet('/users/');

      if (response.error) {
        console.error('Error response:', response.error);
        throw new Error(response.error);
      }

      const data = response.data;
      
      // Handle paginated response - extract results array
      if (data && data.results && Array.isArray(data.results)) {
        setProfiles(data.results);
      } else if (Array.isArray(data)) {
        // Handle direct array response
        setProfiles(data);
      } else {
        console.error('Expected array or paginated response but got:', typeof data, data);
        setProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setFetchingProfiles(false);
    }
  };

  const addSongField = () => {
    setEventForm({
      ...eventForm,
      songs_used: [...eventForm.songs_used, '']
    });
  };

  const removeSongField = (index: number) => {
    if (eventForm.songs_used.length > 1) {
      const newSongs = eventForm.songs_used.filter((_, i) => i !== index);
      setEventForm({
        ...eventForm,
        songs_used: newSongs
      });
    }
  };

  const updateSongField = (index: number, value: string) => {
    const newSongs = [...eventForm.songs_used];
    newSongs[index] = value;
    setEventForm({
      ...eventForm,
      songs_used: newSongs
    });
  };

  const updateDressDetailField = (field: string, value: string) => {
    setEventForm({
      ...eventForm,
      dress_details: {
        ...eventForm.dress_details,
        [field]: value
      }
    });
  };

  const handleParticipantChange = (userId: number, checked: boolean) => {
    if (checked) {
      setEventForm({
        ...eventForm,
        participants: [...eventForm.participants, userId],
        number_of_participants: (eventForm.participants.length + 1).toString()
      });
    } else {
      const newParticipants = eventForm.participants.filter(id => id !== userId);
      setEventForm({
        ...eventForm,
        participants: newParticipants,
        number_of_participants: newParticipants.length.toString()
      });
    }
  };

  const handleStatusUpdate = async (eventId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: "Error",
          description: "No access token found",
          variant: "destructive",
        });
        return;
      }

      const response = await apiPatch(`/events/${eventId}/`, { status: newStatus });

      if (response.error) {
        throw new Error(response.error);
      }

      const updatedEvent = response.data;
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId ? updatedEvent : event
        )
      );
      toast({
        title: "Status Updated",
        description: `Event status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating event status:', error);
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return <AlertCircle className="h-4 w-4" />;
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    if (!status) return 'secondary';
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredEvents = events.filter(event => {
    // Global search - search across all fields
    const globalSearchMatch = !globalSearch || [
      event.day,
      formatDate(event.date),
      event.time,
      event.place,
      event.participation_type || '',
      event.event_reason || '',
      event.status,
      event.meeting_date ? formatDate(event.meeting_date) : '',
      event.vehicle || '',
      event.camera_man || '',
      event.number_of_participants.toString(),
      event.duration.toString()
    ].some(field => field.toLowerCase().includes(globalSearch.toLowerCase()));

    // Date range filter
    const dateRangeMatch = (() => {
      if (!dateRange.from && !dateRange.to) return true;
      
      const eventDate = new Date(event.date);
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;
      
      if (fromDate && toDate) {
        return eventDate >= fromDate && eventDate <= toDate;
      } else if (fromDate) {
        return eventDate >= fromDate;
      } else if (toDate) {
        return eventDate <= toDate;
      }
      return true;
    })();

    // Individual field filters
    const fieldFiltersMatch = (
      (!filters.day || event.day.toLowerCase().includes(filters.day.toLowerCase())) &&
      (!filters.date || formatDate(event.date).includes(filters.date)) &&
      (!filters.time || event.time.includes(filters.time)) &&
      (!filters.place || event.place.toLowerCase().includes(filters.place.toLowerCase())) &&
      (!filters.participation_type || (event.participation_type && event.participation_type.toLowerCase().includes(filters.participation_type.toLowerCase()))) &&
      (!filters.event_reason || (event.event_reason && event.event_reason.toLowerCase().includes(filters.event_reason.toLowerCase()))) &&
      (!filters.status || filters.status === 'all' || event.status.toLowerCase().includes(filters.status.toLowerCase())) &&
      (!filters.meeting_date || (event.meeting_date && formatDate(event.meeting_date).includes(filters.meeting_date))) &&
      (!filters.meeting_time || (event.meeting_time && event.meeting_time.includes(filters.meeting_time))) &&
      (!filters.meeting_place || (event.place_of_meeting && event.place_of_meeting.toLowerCase().includes(filters.meeting_place.toLowerCase()))) &&
      (!filters.vehicle || (event.vehicle && event.vehicle.toLowerCase().includes(filters.vehicle.toLowerCase()))) &&
      (!filters.camera_man || (event.camera_man && event.camera_man.toLowerCase().includes(filters.camera_man.toLowerCase()))) &&
      (!filters.duration || event.duration.toString().includes(filters.duration)) &&
      (!filters.number_of_participants || event.number_of_participants.toString().includes(filters.number_of_participants))
    );

    return globalSearchMatch && fieldFiltersMatch && dateRangeMatch;
  });

  // Apply sorting to filtered events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    const getValue = (event: Event, key: string) => {
      switch (key) {
        case 'day':
          return event.day;
        case 'date':
          return new Date(event.date).getTime();
        case 'time':
          return event.time;
        case 'date_time':
          // Combined date and time sorting for nearest events
          const eventDateTime = new Date(`${event.date}T${event.time}`);
          return eventDateTime.getTime();
        case 'duration':
          return event.duration;
        case 'place':
          return event.place;
        case 'participants':
          return event.number_of_participants;
        case 'participation_type':
          return event.participation_type || '';
        case 'event_reason':
          return event.event_reason || '';
        case 'meeting_date':
          return event.meeting_date ? new Date(event.meeting_date).getTime() : 0;
        case 'meeting_time':
          return event.meeting_time || '';
        case 'meeting_place':
          return event.place_of_meeting || '';
        case 'vehicle':
          return event.vehicle || '';
        case 'camera_man':
          return event.camera_man || '';
        case 'songs_count':
          return event.songs ? event.songs.length : 0;
        case 'dress_count':
          return event.dress_details ? event.dress_details.length : 0;
        case 'selected_participants':
          return event.participants ? event.participants.length : 0;
        case 'status':
          return event.status;
        case 'created':
          return new Date(event.created_at).getTime();
        case 'updated':
          return new Date(event.updated_at).getTime();
        default:
          return '';
      }
    };

    const aValue = getValue(a, sortConfig.key);
    const bValue = getValue(b, sortConfig.key);

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEvents = sortedEvents.slice(startIndex, startIndex + pageSize);

  // Reset or clamp page when data set or page size changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, sortedEvents.length]);

  const clearFilters = () => {
    setFilters({
      day: '',
      date: '',
      time: '',
      place: '',
      participation_type: '',
      event_reason: '',
      status: 'all',
      meeting_date: '',
      vehicle: '',
      camera_man: ''
    });
    setGlobalSearch('');
    setDateRange({ from: '', to: '' });
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // Same column clicked - cycle through: asc -> desc -> null
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { key: null, direction: null };
        }
      }
      // New column clicked - start with asc
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
    if (sortConfig.direction === 'desc') {
      return <ArrowDown className="h-4 w-4 text-primary" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  const handleExportToExcel = () => {
    // Create CSV content (Excel-compatible)
    const headers = [
      'Day', 'Date', 'Time', 'Duration (min)', 'Place', 'Participants',
      'Participation Type', 'Event Reason', 'Meeting Date', 'Meeting Time',
      'Meeting Place', 'Vehicle', 'Camera Man', 'Songs Used', 'Dress Details',
      'Status', 'Created', 'Updated'
    ];

    const csvContent = [
      headers.join(','),
      ...sortedEvents.map(event => [
        `"${event.day}"`,
        `"${formatDate(event.date)}"`,
        `"${event.time}"`,
        event.duration,
        `"${event.place}"`,
        event.number_of_participants,
        `"${event.participation_type || 'N/A'}"`,
        `"${event.event_reason || 'N/A'}"`,
        `"${event.meeting_date ? formatDate(event.meeting_date) : 'N/A'}"`,
        `"${event.meeting_time || 'N/A'}"`,
        `"${event.place_of_meeting || 'N/A'}"`,
        `"${event.vehicle || 'N/A'}"`,
        `"${event.camera_man || 'N/A'}"`,
        `"${event.songs ? event.songs.map(song => song.title).join('; ') : 'N/A'}"`,
        `"${event.dress_details ? event.dress_details.map(detail => detail.description).join('; ') : 'N/A'}"`,
        `"${event.status}"`,
        `"${formatDate(event.created_at)}"`,
        `"${formatDate(event.updated_at)}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `quran-events-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `${sortedEvents.length} events exported to Excel file`,
    });
  };

  const handleDownloadSample = async () => {
    try {
      await apiDownloadFile('/events/import/sample/', 'events_import_template.xlsx');
      
      toast({
        title: t.downloadSample,
        description: "Sample Excel template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download sample file",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleImportEvents = async () => {
    if (!selectedFile) return;

    setImporting(true);
    try {
      const response = await apiUploadFile('/events/import/', selectedFile);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: t.importSuccessful,
        description: response.data?.message || "Events imported successfully",
      });
      
      // Refresh events list
      await fetchEvents();
      
      // Close dialog and reset
      setImportDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Network error during import",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: "Error",
          description: "No access token found",
          variant: "destructive",
        });
        return;
      }

      const response = await apiDelete(`/events/${eventId}/`);

      if (response.error) {
        throw new Error(response.error);
      }

      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "Event has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    
    // Map dress details from array format to object format
    const mapDressDetails = (dressDetails: Array<{id: number; description: string; order: number; created_at: string}> | undefined) => {
      const dressMap = {
        pants: '',
        shirt: '',
        coat: '',
        shoes: '',
        whip: '',
        socks: '',
        accessories: ''
      };
      
      if (dressDetails && dressDetails.length > 0) {
        // Map dress details by order (assuming order corresponds to field type)
        dressDetails.forEach((detail, index) => {
          const keys = Object.keys(dressMap) as Array<keyof typeof dressMap>;
          if (index < keys.length) {
            dressMap[keys[index]] = detail.description;
          }
        });
      }
      
      return dressMap;
    };
    
    setEventForm({
      day: event.day,
      date: event.date,
      time: event.time,
      duration: event.duration.toString(),
      place: event.place,
      number_of_participants: event.number_of_participants.toString(),
      meeting_time: event.meeting_time || '',
      meeting_date: event.meeting_date || '',
      place_of_meeting: event.place_of_meeting || '',
      vehicle: event.vehicle || '',
      camera_man: event.camera_man || '',
      participation_type: event.participation_type || '',
      event_reason: event.event_reason || '',
      songs_used: event.songs ? event.songs.map(song => song.title) : [''],
      dress_details: mapDressDetails(event.dress_details),
      participants: event.participants ? event.participants.map(p => p.user_id) : []
    });
    setDialogOpen(true);
  };

  const handleDeleteConfirm = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteConfirmOpen(true);
  };

  const handleCompleteConfirm = (eventId: string) => {
    setEventToComplete(eventId);
    setCompleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      handleDeleteEvent(eventToDelete);
      setEventToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const confirmComplete = () => {
    if (eventToComplete) {
      handleStatusUpdate(eventToComplete, 'completed');
      setEventToComplete(null);
    }
    setCompleteConfirmOpen(false);
  };

  const handleCancelConfirm = (eventId: string) => {
    setEventToCancel(eventId);
    setCancelConfirmOpen(true);
  };

  const confirmCancel = () => {
    if (eventToCancel) {
      handleStatusUpdate(eventToCancel, 'cancelled');
      setEventToCancel(null);
    }
    setCancelConfirmOpen(false);
  };

  const handleViewEvent = (event: Event) => {
    setEventToView(event);
    setViewEventOpen(true);
  };

  const handleViewParticipants = (event: Event) => {
    setParticipantsEvent(event);
    setIsParticipantsDialogOpen(true);
  };

  const resetForm = () => {
    setEventForm({
      day: '',
      date: '',
      time: '',
      duration: '',
      place: '',
      number_of_participants: '',
      meeting_time: '',
      meeting_date: '',
      place_of_meeting: '',
      vehicle: '',
      camera_man: '',
      participation_type: '',
      event_reason: '',
      songs_used: [''],
      dress_details: {
        pants: '',
        shirt: '',
        coat: '',
        shoes: '',
        whip: '',
        socks: '',
        accessories: ''
      },
      participants: [],
    });
    setEditingEvent(null);
  };

  const handleViewSongs = (event: Event) => {
    setEventForDetails(event);
    setSongsDialogOpen(true);
  };

  const handleViewDressDetails = (event: Event) => {
    setEventForDetails(event);
    setDressDialogOpen(true);
  };

  const generateEventContent = (event: Event) => {
    return `
Quran Event Details
===================

Event Information:
- Day: ${event.day}
- Date: ${formatDate(event.date)}
- Time: ${event.time}
- Duration: ${event.duration} minutes
- Place: ${event.place}

Participation Details:
- Type: ${event.participation_type || 'N/A'}
- Reason: ${event.event_reason || 'N/A'}
- Participants: ${event.number_of_participants}

Meeting Information:
- Meeting Date: ${event.meeting_date ? formatDate(event.meeting_date) : 'N/A'}
- Meeting Time: ${event.meeting_time || 'N/A'}
- Meeting Place: ${event.place_of_meeting || 'N/A'}

Logistics:
- Vehicle: ${event.vehicle || 'N/A'}
- Camera Person: ${event.camera_man || 'N/A'}

Songs Used:
${event.songs && event.songs.length > 0 
  ? event.songs.map(song => `- ${song.title}`).join('\n')
  : 'N/A'}

Dress Details:
${event.dress_details && event.dress_details.length > 0 
  ? event.dress_details.map(detail => `- ${detail.description}`).join('\n')
  : 'N/A'}

Status: ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
Created: ${formatDate(event.created_at)}
Updated: ${formatDate(event.updated_at)}
    `;
  };

  const handleShareEvent = (event: Event) => {
    generateEventPDF(event);
  };

  const handleBulkShare = () => {
    setBulkShareOpen(true);
  };

  const handleSelectEventForShare = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEventsForShare(prev => [...prev, eventId]);
    } else {
      setSelectedEventsForShare(prev => prev.filter(id => id !== eventId));
    }
  };

  const handleSelectAllEvents = (checked: boolean) => {
    if (checked) {
      setSelectedEventsForShare(events.map(event => event.id));
    } else {
      setSelectedEventsForShare([]);
    }
  };

  const generateBulkEventsContent = () => {
    if (selectedEventsForShare.length === 0) {
      return '';
    }

    const selectedEvents = events.filter(event => selectedEventsForShare.includes(event.id));
    
    return `
Quran Events Summary
====================

Total Events: ${selectedEvents.length}
Generated: ${new Date().toLocaleDateString()}

${selectedEvents.map((event, index) => `
Event ${index + 1}:
- Day: ${event.day}
- Date: ${formatDate(event.date)}
- Time: ${event.time}
- Duration: ${event.duration} minutes
- Place: ${event.place}
- Participants: ${event.number_of_participants}
- Status: ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
- Participation Type: ${event.participation_type || 'N/A'}
- Reason: ${event.event_reason || 'N/A'}
${event.songs && event.songs.length > 0 ? `- Songs: ${event.songs.map(song => song.title).join(', ')}` : ''}
${event.dress_details && event.dress_details.length > 0 ? `- Dress: ${event.dress_details.map(detail => detail.description).join(', ')}` : ''}
`).join('\n')}
    `;
  };

  const generateBulkEventsPDF = () => {
    if (selectedEventsForShare.length === 0) {
      toast({
        title: "No Events Selected",
        description: "Please select at least one event to share",
        variant: "destructive",
      });
      return;
    }

    const bulkEventDetails = generateBulkEventsContent();

    // Create a blob with the bulk event details
    const blob = new Blob([bulkEventDetails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `quran-events-bulk-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Events Downloaded",
      description: `${selectedEventsForShare.length} events have been downloaded as text file`,
    });

    setBulkShareOpen(false);
    setSelectedEventsForShare([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.day || !eventForm.date || !eventForm.time || !eventForm.place || !eventForm.duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setConfirmDialogOpen(false);

    try {
      if (editingEvent) {
        // Update existing event - save to database

        const eventData = {
          day: eventForm.day,
          date: eventForm.date,
          time: eventForm.time,
          duration: parseInt(eventForm.duration),
          place: eventForm.place,
          number_of_participants: parseInt(eventForm.number_of_participants) || 0,
          meeting_time: eventForm.meeting_time || null,
          meeting_date: eventForm.meeting_date || null,
          place_of_meeting: eventForm.place_of_meeting || null,
          vehicle: eventForm.vehicle || null,
          camera_man: eventForm.camera_man || null,
          participation_type: eventForm.participation_type || null,
          event_reason: eventForm.event_reason || null,
          songs_data: eventForm.songs_used.filter(song => song.trim() !== '').map(song => ({ title: song, artist: '', duration: null })),
          dress_details_data: Object.entries(eventForm.dress_details)
            .filter(([key, value]) => value.trim() !== '')
            .map(([key, value]) => value),
          participants_data: eventForm.participants,
        };

        const response = await apiPatch(`/events/${editingEvent.id}/`, eventData);

        if (response.error) {
          throw new Error(response.error);
        }

        const updatedEvent = response.data;
        setEvents(prev => prev.map(event => event.id === editingEvent.id ? updatedEvent : event));
        setEditingEvent(null);

        toast({
          title: "Success!",
          description: "Event has been updated successfully",
        });
      } else {
        // Create new event - save to database

        // Helper function to format time with seconds
        const formatTime = (timeStr: string) => {
          if (!timeStr) return null;
          // If time already has seconds, return as is
          if (timeStr.split(':').length === 3) return timeStr;
          // Add seconds if missing
          return timeStr + ':00';
        };

        // Validate duration (must be positive)
        const duration = parseInt(eventForm.duration);
        if (!Number.isFinite(duration) || duration <= 0) {
          toast({
            title: "Invalid Duration",
            description: "Duration must be a positive number",
            variant: "destructive",
          });
          return;
        }

        const eventData = {
          day: eventForm.day,
          date: eventForm.date,
          time: formatTime(eventForm.time),
          duration: duration,
          place: eventForm.place,
          number_of_participants: parseInt(eventForm.number_of_participants) || 0,
          status: 'pending', // Always start as pending
          meeting_time: formatTime(eventForm.meeting_time),
          meeting_date: eventForm.meeting_date || null,
          place_of_meeting: eventForm.place_of_meeting || null,
          vehicle: eventForm.vehicle || null,
          camera_man: eventForm.camera_man || null,
          participation_type: eventForm.participation_type || null,
          event_reason: eventForm.event_reason || null,
          songs_data: eventForm.songs_used.filter(song => song.trim() !== '').map(song => ({ title: song, artist: '', duration: null })),
          dress_details_data: Object.entries(eventForm.dress_details)
            .filter(([key, value]) => value.trim() !== '')
            .map(([key, value]) => value),
          participants_data: eventForm.participants,
        };

        console.log('Event data being sent:', JSON.stringify(eventData, null, 2));

        const response = await apiPost('/events/', eventData);

        console.log('API Response:', response);

        if (response.error) {
          console.error('API Error:', response.error);
          throw new Error(response.error);
        }

        const newEvent = response.data;
        console.log('Created event from API:', newEvent);
        setEvents(prev => [newEvent, ...prev]);

        toast({
          title: "Success!",
          description: "Event has been created successfully",
        });
      }

      // Reset form
      resetForm();
      setDialogOpen(false);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-3 sm:space-y-4 md:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`px-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t.eventManagement}</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
            Create and manage events
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleBulkShare} variant="outline" className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t.shareEvents}</span>
            <span className="sm:hidden">Share</span>
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Plus className="h-4 w-4" />
              {t.addNewEvent}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Update the event details' : 'Fill in the event details below'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="day" className={isRTL ? 'text-right' : 'text-left'}>{t.day} *</Label>
                  <Input
                    id="day"
                    placeholder="e.g., Friday"
                    value={eventForm.day}
                    onChange={(e) => setEventForm({ ...eventForm, day: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className={isRTL ? 'text-right' : 'text-left'}>{t.date} *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className={isRTL ? 'text-right' : 'text-left'}>{t.time} *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className={isRTL ? 'text-right' : 'text-left'}>{t.duration} (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 120 (positive minutes)"
                    value={eventForm.duration}
                    onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })}
                    min="1"
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="place" className={isRTL ? 'text-right' : 'text-left'}>{t.place} *</Label>
                  <Input
                    id="place"
                    placeholder="Event location"
                    value={eventForm.place}
                    onChange={(e) => setEventForm({ ...eventForm, place: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participants" className={isRTL ? 'text-right' : 'text-left'}>Number of Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    placeholder="Expected participants"
                    value={eventForm.number_of_participants}
                    onChange={(e) => setEventForm({ ...eventForm, number_of_participants: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_time" className={isRTL ? 'text-right' : 'text-left'}>Meeting Time</Label>
                  <Input
                    id="meeting_time"
                    type="time"
                    value={eventForm.meeting_time}
                    onChange={(e) => setEventForm({ ...eventForm, meeting_time: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_date" className={isRTL ? 'text-right' : 'text-left'}>{t.meetingDate}</Label>
                  <Input
                    id="meeting_date"
                    type="date"
                    value={eventForm.meeting_date}
                    onChange={(e) => setEventForm({ ...eventForm, meeting_date: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="place_of_meeting" className={isRTL ? 'text-right' : 'text-left'}>{t.meetingPlace}</Label>
                  <Input
                    id="place_of_meeting"
                    placeholder="Meeting location"
                    value={eventForm.place_of_meeting}
                    onChange={(e) => setEventForm({ ...eventForm, place_of_meeting: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle" className={isRTL ? 'text-right' : 'text-left'}>Vehicle</Label>
                  <Input
                    id="vehicle"
                    placeholder="Transportation details"
                    value={eventForm.vehicle}
                    onChange={(e) => setEventForm({ ...eventForm, vehicle: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="camera_man" className={isRTL ? 'text-right' : 'text-left'}>Camera Man</Label>
                  <Input
                    id="camera_man"
                    placeholder="Camera operator"
                    value={eventForm.camera_man}
                    onChange={(e) => setEventForm({ ...eventForm, camera_man: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participation_type" className={isRTL ? 'text-right' : 'text-left'}>{t.participationType}</Label>
                  <Input
                    id="participation_type"
                    placeholder="e.g., Recitation, Listening, etc."
                    value={eventForm.participation_type}
                    onChange={(e) => setEventForm({ ...eventForm, participation_type: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="event_reason" className={isRTL ? 'text-right' : 'text-left'}>{t.eventPurpose}</Label>
                  <Textarea
                    id="event_reason"
                    placeholder="Purpose or reason for this event"
                    value={eventForm.event_reason}
                    onChange={(e) => setEventForm({ ...eventForm, event_reason: e.target.value })}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>
              </div>

              {/* Songs Used */}
              <div className="space-y-2">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Label className={isRTL ? 'text-right' : 'text-left'}>Songs Used</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSongField}>
                    <Plus className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    Add Song
                  </Button>
                </div>
                <div className="space-y-2">
                  {eventForm.songs_used.map((song, index) => (
                    <div key={index} className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Input
                        placeholder={`Song ${index + 1}`}
                        value={song}
                        onChange={(e) => updateSongField(index, e.target.value)}
                        className={isRTL ? 'text-right' : 'text-left'}
                      />
                      {eventForm.songs_used.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSongField(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dress Details */}
              <div className="space-y-4">
                <Label className={`text-base font-medium ${isRTL ? 'text-right' : 'text-left'}`}>Dress Details</Label>
                <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                    <Label htmlFor="dress-pants" className={isRTL ? 'text-right' : 'text-left'}>{t.pants}</Label>
                    <Input
                      id="dress-pants"
                      placeholder={`${t.pants} details...`}
                      value={eventForm.dress_details.pants}
                      onChange={(e) => updateDressDetailField('pants', e.target.value)}
                      className={isRTL ? 'text-right' : 'text-left'}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dress-shirt" className={isRTL ? 'text-right' : 'text-left'}>{t.shirt}</Label>
                      <Input
                      id="dress-shirt"
                      placeholder={`${t.shirt} details...`}
                      value={eventForm.dress_details.shirt}
                      onChange={(e) => updateDressDetailField('shirt', e.target.value)}
                      className={isRTL ? 'text-right' : 'text-left'}
                    />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="dress-coat" className={isRTL ? 'text-right' : 'text-left'}>{t.coat}</Label>
                    <Input
                      id="dress-coat"
                      placeholder={`${t.coat} details...`}
                      value={eventForm.dress_details.coat}
                      onChange={(e) => updateDressDetailField('coat', e.target.value)}
                      className={isRTL ? 'text-right' : 'text-left'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dress-shoes" className={isRTL ? 'text-right' : 'text-left'}>{t.shoes}</Label>
                    <Input
                      id="dress-shoes"
                      placeholder={`${t.shoes} details...`}
                      value={eventForm.dress_details.shoes}
                      onChange={(e) => updateDressDetailField('shoes', e.target.value)}
                      className={isRTL ? 'text-right' : 'text-left'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dress-whip" className={isRTL ? 'text-right' : 'text-left'}>{t.whip}</Label>
                    <Input
                      id="dress-whip"
                      placeholder={`${t.whip} details...`}
                      value={eventForm.dress_details.whip}
                      onChange={(e) => updateDressDetailField('whip', e.target.value)}
                      className={isRTL ? 'text-right' : 'text-left'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dress-socks" className={isRTL ? 'text-right' : 'text-left'}>{t.socks}</Label>
                    <Input
                      id="dress-socks"
                      placeholder={`${t.socks} details...`}
                      value={eventForm.dress_details.socks}
                      onChange={(e) => updateDressDetailField('socks', e.target.value)}
                      className={isRTL ? 'text-right' : 'text-left'}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dress-accessories" className={isRTL ? 'text-right' : 'text-left'}>{t.accessories}</Label>
                    <Input
                      id="dress-accessories"
                      placeholder={`${t.accessories} details...`}
                      value={eventForm.dress_details.accessories}
                      onChange={(e) => updateDressDetailField('accessories', e.target.value)}
                      className={isRTL ? 'text-right' : 'text-left'}
                    />
                  </div>
                </div>
              </div>

              {/* Participants Selection */}
              <div className="space-y-3">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Label className={`text-base font-medium ${isRTL ? 'text-right' : 'text-left'}`}>Select Participants</Label>
                  <span className="text-sm text-muted-foreground">
                    {eventForm.participants.length} selected
                  </span>
                </div>
                
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-muted/20">
                  <div className="max-h-48 overflow-y-auto space-y-3">
                    {fetchingProfiles ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
                      </div>
                    ) : profiles.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No users available</p>
                        <p className="text-xs text-muted-foreground mt-1">Profiles count: {profiles.length}</p>
                      </div>
                    ) : (
                      profiles.map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={`participant-${user.id}`}
                            checked={eventForm.participants.includes(parseInt(user.id))}
                            onCheckedChange={(checked) => handleParticipantChange(parseInt(user.id), checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={`participant-${user.id}`} 
                              className="text-sm font-medium cursor-pointer flex items-center space-x-2"
                            >
                              <span className="truncate">{user.name}</span>
                              <span className="text-muted-foreground">(@{user.username})</span>
                            </Label>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {eventForm.participants.length > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                    <p className="text-sm font-medium text-primary">
                      ✓ {eventForm.participants.length} participant{eventForm.participants.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  resetForm();
                  setDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit">{editingEvent ? 'Update Event' : 'Create Event'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Confirm Event Update' : 'Confirm Event Creation'}</DialogTitle>
            <DialogDescription>
              {editingEvent 
                ? 'Are you sure you want to update this event with the provided details?'
                : 'Are you sure you want to create this event with the provided details?'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              No, Cancel
            </Button>
            <Button onClick={confirmSubmit} disabled={loading}>
              {editingEvent ? 'Yes, Update Event' : 'Yes, Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CalendarIcon className="h-5 w-5" />
                {t.eventsList}
              </CardTitle>
              <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                {t.allEventsInSystem} ({sortedEvents.length} of {events.length} {t.shown})
                {sortConfig.key && sortConfig.direction && (
                  <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-primary`}>
                    • Sorted by {sortConfig.key} ({sortConfig.direction === 'asc' ? 'A to Z' : 'Z to A'})
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => handleSort('date_time')}
                  className={`gap-2 w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                  size="sm"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.nearestEvents}</span>
                  <span className="sm:hidden">{t.nearestEvents}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportToExcel}
                  className={`gap-2 w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                  size="sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.exportExcel}</span>
                  <span className="sm:hidden">{t.exportExcel}</span>
                </Button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`gap-2 w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                  size="sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : t.showFilters}</span>
                  <span className="sm:hidden">{showFilters ? 'Hide Filters' : t.showFilters}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadSample}
                  className="gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.downloadExcelSample}</span>
                  <span className="sm:hidden">{t.downloadSample}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setImportDialogOpen(true)}
                  className="gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.importEvents}</span>
                  <span className="sm:hidden">{t.importEvents}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="space-y-4">
              {/* Global Search */}
              <div className="space-y-2">
                <Label htmlFor="global-search">Global Search</Label>
                <Input
                  id="global-search"
                  placeholder="Search across all fields..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Search across day, date, time, place, participation type, reason, status, and more...
                </p>
              </div>
              
              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Date Range Filter</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-from">From Date</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-to">To Date</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Filter events within a specific date range
                </p>
              </div>
              
              {/* Individual Filters */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="filter-day">Day</Label>
                <Input
                  id="filter-day"
                  placeholder="Filter by day..."
                  value={filters.day}
                  onChange={(e) => setFilters(prev => ({ ...prev, day: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-date">Date</Label>
                <Input
                  id="filter-date"
                  placeholder="Filter by date..."
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-time">Time</Label>
                <Input
                  id="filter-time"
                  placeholder="Filter by time..."
                  value={filters.time}
                  onChange={(e) => setFilters(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-place">Place</Label>
                <Input
                  id="filter-place"
                  placeholder="Filter by place..."
                  value={filters.place}
                  onChange={(e) => setFilters(prev => ({ ...prev, place: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-participation">Participation Type</Label>
                <Select value={filters.participation_type || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, participation_type: value === '__all__' ? '' : value }))}>
                  <SelectTrigger id="filter-participation">
                    <SelectValue placeholder="All participation types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All participation types</SelectItem>
                    {Array.from(new Set(events.map(e => e.participation_type).filter(Boolean)))
                      .map((val) => (
                        <SelectItem key={`pt-${val}`} value={String(val)}>{String(val)}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-reason">Event Reason</Label>
                <Select value={filters.event_reason || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, event_reason: value === '__all__' ? '' : value }))}>
                  <SelectTrigger id="filter-reason">
                    <SelectValue placeholder="All reasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All reasons</SelectItem>
                    {Array.from(new Set(events.map(e => e.event_reason).filter(Boolean)))
                      .map((val) => (
                        <SelectItem key={`er-${val}`} value={String(val)}>{String(val)}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-meeting-date">Meeting Date</Label>
                <Input
                  id="filter-meeting-date"
                  placeholder="Filter by meeting date..."
                  value={filters.meeting_date}
                  onChange={(e) => setFilters(prev => ({ ...prev, meeting_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-meeting-time">Meeting Time</Label>
                <Input
                  id="filter-meeting-time"
                  placeholder="Filter by meeting time..."
                  value={filters.meeting_time}
                  onChange={(e) => setFilters(prev => ({ ...prev, meeting_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-meeting-place">Meeting Place</Label>
                <Input
                  id="filter-meeting-place"
                  placeholder="Filter by meeting place..."
                  value={filters.meeting_place}
                  onChange={(e) => setFilters(prev => ({ ...prev, meeting_place: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-vehicle">Vehicle</Label>
                <Input
                  id="filter-vehicle"
                  placeholder="Filter by vehicle..."
                  value={filters.vehicle}
                  onChange={(e) => setFilters(prev => ({ ...prev, vehicle: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-camera">Camera Man</Label>
                <Input
                  id="filter-camera"
                  placeholder="Filter by camera man..."
                  value={filters.camera_man}
                  onChange={(e) => setFilters(prev => ({ ...prev, camera_man: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-duration">Duration</Label>
                <Input
                  id="filter-duration"
                  placeholder="Filter by duration..."
                  value={filters.duration}
                  onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-participants">Participants</Label>
                <Input
                  id="filter-participants"
                  placeholder="Filter by participants..."
                  value={filters.number_of_participants}
                  onChange={(e) => setFilters(prev => ({ ...prev, number_of_participants: e.target.value }))}
                />
              </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Events List
          </CardTitle>
          <CardDescription>
            All events in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingEvents ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('day')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.day}
                        {getSortIcon('day')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('date')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.date}
                        {getSortIcon('date')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[80px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('time')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.time}
                        {getSortIcon('time')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[120px] cursor-pointer hover:bg-muted/50 select-none bg-primary/5"
                      onClick={() => handleSort('date_time')}
                    >
                      <div className={`flex items-center gap-2 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className="h-4 w-4" />
                        Nearest
                        {getSortIcon('date_time')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[80px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('duration')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.duration}
                        {getSortIcon('duration')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('place')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.place}
                        {getSortIcon('place')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('participants')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.participants}
                        {getSortIcon('participants')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('participation_type')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.participationType}
                        {getSortIcon('participation_type')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[150px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('event_reason')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.eventPurpose}
                        {getSortIcon('event_reason')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('meeting_date')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.meetingDate}
                        {getSortIcon('meeting_date')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('meeting_time')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        Meeting Time
                        {getSortIcon('meeting_time')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('meeting_place')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.meetingPlace}
                        {getSortIcon('meeting_place')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('vehicle')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        Vehicle
                        {getSortIcon('vehicle')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('camera_man')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        Camera Man
                        {getSortIcon('camera_man')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[150px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('songs_count')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        Songs Used
                        {getSortIcon('songs_count')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[150px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('dress_count')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        Dress Details
                        {getSortIcon('dress_count')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.status}
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('created')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.created}
                        {getSortIcon('created')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('updated')}
                    >
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t.updated}
                        {getSortIcon('updated')}
                      </div>
                    </TableHead>
                    <TableHead className={`w-[200px] min-w-[200px] ${isRTL ? 'text-right' : 'text-left'}`}>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={20} className="text-center py-8 text-muted-foreground">
                        {events.length === 0 ? 'No events found. Create your first event!' : 'No events match the current filters.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                            <p className="font-medium">{event.day}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDate(event.date)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{event.time}</p>
                        </TableCell>
                        <TableCell className="bg-primary/5">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" />
                            <p className="text-sm font-medium">
                              {new Date(`${event.date}T${event.time}`).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{event.duration} min</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{event.place}</p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p 
                              className="font-medium cursor-pointer hover:text-primary hover:underline"
                              onClick={() => handleViewParticipants(event)}
                              title="Click to view all participants"
                            >
                              {event.number_of_participants}
                            </p>
                            {event.participants && event.participants.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {event.participants.slice(0, 2).map((participant, index) => (
                                  <span key={participant.id}>
                                    {participant.user_name}
                                    {index < Math.min(event.participants.length, 2) - 1 && ', '}
                                  </span>
                                ))}
                                {event.participants.length > 2 && (
                                  <span> +{event.participants.length - 2} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{event.participation_type || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm truncate" title={event.event_reason || 'N/A'}>
                            {event.event_reason || 'N/A'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{event.meeting_date ? formatDate(event.meeting_date) : 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{event.meeting_time || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{event.place_of_meeting || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{event.vehicle || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{event.camera_man || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px]">
                            {event.songs && event.songs.length > 0 ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => handleViewSongs(event)}
                              >
                                <Music className="h-3 w-3 mr-1" />
                                Songs ({event.songs.length})
                              </Button>
                            ) : (
                              <p className="text-sm text-muted-foreground">N/A</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px]">
                            {event.dress_details && event.dress_details.length > 0 ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => handleViewDressDetails(event)}
                              >
                                <Shirt className="h-3 w-3 mr-1" />
                                Dress ({event.dress_details.length})
                              </Button>
                            ) : (
                              <p className="text-sm text-muted-foreground">N/A</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadgeVariant(event.status)}
                            className={`status-${event.status} flex items-center gap-1`}
                          >
                            {getStatusIcon(event.status)}
                            {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDate(event.created_at)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDate(event.updated_at)}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1">
                            {event.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCompleteConfirm(event.id)}
                                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Mark as completed"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelConfirm(event.id)}
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Cancel event"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              title="View event details"
                              onClick={() => handleViewEvent(event)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              title="Edit event"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <UniversalShare
                              content={generateEventContent(event)}
                              title={`${event.day} Event - ${event.date}`}
                              filename={`quran-event-${event.day}-${event.date}.txt`}
                            >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700"
                              title="Share event"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                            </UniversalShare>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              title="Delete event"
                              onClick={() => handleDeleteConfirm(event.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {sortedEvents.length === 0 ? (
                  <span>Showing 0 of 0</span>
                ) : (
                  <span>{`Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, sortedEvents.length)} of ${sortedEvents.length}`}</span>
                )}
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground">Rows</Label>
                  <Select value={String(pageSize)} onValueChange={(v) => setPageSize(parseInt(v))}>
                    <SelectTrigger className="h-8 w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              No, Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation Dialog */}
      <Dialog open={completeConfirmOpen} onOpenChange={setCompleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Complete</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this event as completed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteConfirmOpen(false)}>
              No, Cancel
            </Button>
            <Button onClick={confirmComplete}>
              Yes, Mark as Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancel</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this event?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelConfirmOpen(false)}>
              No, Cancel
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Yes, Cancel Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={viewEventOpen} onOpenChange={setViewEventOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Event Details</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Complete information about this event
            </DialogDescription>
          </DialogHeader>
          {eventToView && (
            <div className="space-y-6 py-4">
              {/* Event Overview */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-primary">Event Overview</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Day & Date</Label>
                        <p className="text-base font-medium">{eventToView.day} - {formatDate(eventToView.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Time & Duration</Label>
                        <p className="text-base font-medium">{eventToView.time} ({eventToView.duration} minutes)</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Place</Label>
                        <p className="text-base font-medium">{eventToView.place}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Participants</Label>
                        <p className="text-base font-medium">{eventToView.number_of_participants} participants</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants Section */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Participants</span>
                </h3>
                {eventToView.participants && eventToView.participants.length > 0 ? (
                  <div className="grid gap-2">
                    {eventToView.participants.map((participant, index) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-base">{participant.user_name}</p>
                            <p className="text-sm text-muted-foreground">Joined: {formatDate(participant.joined_at)}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={participant.is_confirmed ? "default" : "secondary"}
                          className="text-sm px-3 py-1"
                        >
                          {participant.is_confirmed ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-base">No participants assigned</p>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Participation Type</Label>
                    <p className="text-base font-medium mt-1">{eventToView.participation_type || 'N/A'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(eventToView.status)} className="text-sm px-3 py-1">
                        {eventToView.status ? eventToView.status.charAt(0).toUpperCase() + eventToView.status.slice(1) : 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-base font-medium mt-1">{formatDate(eventToView.created_at)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                    <p className="text-base font-medium mt-1">{formatDate(eventToView.updated_at)}</p>
                  </div>
                </div>
              </div>
              
              {/* Event Reason */}
              {eventToView.event_reason && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Event Reason</h3>
                  <p className="text-base leading-relaxed">{eventToView.event_reason}</p>
                </div>
              )}

              {/* Meeting Details */}
              {eventToView.meeting_date && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span>Meeting Details</span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="p-3 bg-background border rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                      <p className="text-base font-medium mt-1">{formatDate(eventToView.meeting_date)}</p>
                    </div>
                    <div className="p-3 bg-background border rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                      <p className="text-base font-medium mt-1">{eventToView.meeting_time || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-background border rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Place</Label>
                      <p className="text-base font-medium mt-1">{eventToView.place_of_meeting || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logistics */}
              {eventToView.vehicle && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Car className="h-5 w-5" />
                    <span>Logistics</span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 bg-background border rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Vehicle</Label>
                      <p className="text-base font-medium mt-1">{eventToView.vehicle}</p>
                    </div>
                    <div className="p-3 bg-background border rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Camera Person</Label>
                      <p className="text-base font-medium mt-1">{eventToView.camera_man || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Songs */}
              {eventToView.songs && eventToView.songs.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Music className="h-5 w-5" />
                    <span>Songs Used</span>
                  </h3>
                  <div className="grid gap-2">
                    {eventToView.songs.map((song, index) => (
                      <div key={index} className="p-3 bg-background border rounded-lg flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-base">{song.title}</p>
                          {song.artist && <p className="text-sm text-muted-foreground">by {song.artist}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dress Details */}
              {eventToView.dress_details && eventToView.dress_details.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Shirt className="h-5 w-5" />
                    <span>Dress Details</span>
                  </h3>
                  <div className="grid gap-2">
                    {eventToView.dress_details.map((detail, index) => {
                      const labels = [t.pants, t.shirt, t.coat, t.shoes, t.whip, t.socks, t.accessories];
                      const label = labels[index] || `${t.shirt}`;
                      return (
                        <div key={index} className="p-3 bg-background border rounded-lg flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <p className="text-base font-medium">{label}: {detail.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewEventOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Share Events Dialog */}
      <Dialog open={bulkShareOpen} onOpenChange={setBulkShareOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Events</DialogTitle>
            <DialogDescription>
              Select events to share via any app or platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedEventsForShare.length === events.length}
                onCheckedChange={handleSelectAllEvents}
              />
              <Label htmlFor="select-all" className="text-sm font-medium">
                Select All Events ({events.length})
              </Label>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    id={`event-${event.id}`}
                    checked={selectedEventsForShare.includes(event.id)}
                    onCheckedChange={(checked) => handleSelectEventForShare(event.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`event-${event.id}`} className="text-sm font-medium">
                      {event.day} - {formatDate(event.date)} at {event.time}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {event.place} • {event.number_of_participants} participants • {event.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedEventsForShare.length > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                <p className="text-sm font-medium text-primary">
                  ✓ {selectedEventsForShare.length} event{selectedEventsForShare.length !== 1 ? 's' : ''} selected for sharing
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkShareOpen(false)}>
              Cancel
            </Button>
            <UniversalShare
              content={generateBulkEventsContent()}
              title={`Quran Events Summary - ${selectedEventsForShare.length} Events`}
              filename={`quran-events-bulk-${new Date().toISOString().split('T')[0]}.txt`}
            >
              <Button disabled={selectedEventsForShare.length === 0}>
                <Share2 className="h-4 w-4 mr-2" />
                Share {selectedEventsForShare.length} Event{selectedEventsForShare.length !== 1 ? 's' : ''}
              </Button>
            </UniversalShare>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Songs Dialog */}
      <Dialog open={songsDialogOpen} onOpenChange={setSongsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Songs Used</DialogTitle>
            <DialogDescription>
              Songs for this event
            </DialogDescription>
          </DialogHeader>
          {eventForDetails && (
            <div className="space-y-2">
              {eventForDetails.songs && eventForDetails.songs.length > 0 ? (
                <ul className="space-y-2">
                  {eventForDetails.songs.map((song, index) => (
                    <li key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Music className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{song.title}</p>
                        {song.artist && <p className="text-sm text-muted-foreground">{song.artist}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No songs specified for this event.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSongsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dress Details Dialog */}
      <Dialog open={dressDialogOpen} onOpenChange={setDressDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dress Details</DialogTitle>
            <DialogDescription>
              Dress requirements for this event
            </DialogDescription>
          </DialogHeader>
          {eventForDetails && (
            <div className="space-y-2">
              {eventForDetails.dress_details && eventForDetails.dress_details.length > 0 ? (
                <ul className="space-y-2">
                  {eventForDetails.dress_details.map((detail, index) => (
                    <li key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Shirt className="h-4 w-4 text-primary" />
                      <p className="font-medium">{detail.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No dress details specified for this event.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDressDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Events Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.importEvents}</DialogTitle>
            <DialogDescription>
              Upload an Excel file to import multiple events at once. Download the sample template to see the required format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excel-file">{t.selectFile}</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Need a template?</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {t.downloadTemplate}
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setSelectedFile(null);
              }}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleImportEvents}
              disabled={!selectedFile || importing}
              className="gap-2"
            >
              {importing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {t.importExcel}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Participants Dialog */}
      <Dialog open={isParticipantsDialogOpen} onOpenChange={setIsParticipantsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event Participants</DialogTitle>
            <DialogDescription>
              {participantsEvent && (
                <>
                  {participantsEvent.day} - {formatDate(participantsEvent.date)} at {participantsEvent.time}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {participantsEvent && participantsEvent.participants && participantsEvent.participants.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Total: {participantsEvent.participants.length} participants
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {participantsEvent.participants.map((participant, index) => (
                    <div 
                      key={participant.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{participant.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {formatDate(participant.joined_at)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={participant.is_confirmed ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {participant.is_confirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No participants found for this event.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsParticipantsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}