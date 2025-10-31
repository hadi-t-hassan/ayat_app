import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, Users, ArrowUpDown, ArrowUp, ArrowDown, Music, Shirt, Car, Camera, Eye, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { UniversalShare } from '@/components/UniversalShare';
import { apiGet } from '@/utils/api';

// Event type
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

export default function ViewParties() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewEventOpen, setViewEventOpen] = useState(false);
  const [eventToView, setEventToView] = useState<Event | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        setEvents([]);
        return;
      }

      const response = await apiGet('/events/');

      if (response.error) {
        throw new Error(response.error);
      }

      const data = response.data;
      
      // Handle paginated response - extract results array
      if (data && data.results && Array.isArray(data.results)) {
        setEvents(data.results);
      } else if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('Expected array or paginated response but got:', typeof data, data);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByStatus = (status: string) => {
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      // Normalize status values for case-insensitive comparison and handle null/undefined
      const eventStatus = (event.status || '').toLowerCase().trim();
      const filterStatus = (status || '').toLowerCase().trim();
      
      // Return true if statuses match exactly
      return eventStatus === filterStatus;
    });
  };

  const sortEvents = (events: Event[]) => {
    if (!sortConfig.key || !sortConfig.direction) return events;

    return [...events].sort((a, b) => {
      const getValue = (event: Event, key: string) => {
        switch (key) {
          case 'date':
            return new Date(event.date).getTime();
          case 'time':
            return event.time;
          case 'duration':
            return event.duration;
          case 'participants':
            return event.number_of_participants;
          case 'place':
            return event.place;
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
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { key: null, direction: null };
        }
      }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewEvent = (event: Event) => {
    setEventToView(event);
    setViewEventOpen(true);
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
    // This function is no longer needed as we use UniversalShare directly
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className={`hover:shadow-lg transition-all duration-200 ${isRTL ? 'border-r-4 border-r-primary' : 'border-l-4 border-l-primary'}`}>
      <CardHeader className="pb-3">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={`text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{event.day} {t.event}</CardTitle>
          <Badge 
            variant={event.status === 'completed' ? 'default' : 
                    event.status === 'cancelled' ? 'destructive' : 
                    event.status === 'confirmed' ? 'secondary' : 'outline'}
            className="capitalize"
          >
            {event.status}
          </Badge>
        </div>
        {event.participation_type && (
          <CardDescription className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            {event.participation_type} • {event.event_reason}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="h-4 w-4 text-primary" />
            <span className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{formatDate(event.date)}</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Clock className="h-4 w-4 text-primary" />
            <span className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{event.time}</span>
          </div>
        </div>

        {/* Location and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MapPin className="h-4 w-4" />
            <span className={`truncate ${isRTL ? 'text-right' : 'text-left'}`}>{event.place}</span>
          </div>
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Clock className="h-4 w-4" />
            <span className={isRTL ? 'text-right' : 'text-left'}>{event.duration} min</span>
          </div>
        </div>

        {/* Participants */}
        <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Users className="h-4 w-4" />
          <span className={isRTL ? 'text-right' : 'text-left'}>{event.number_of_participants} {t.participants}</span>
          {event.participants && event.participants.length > 0 && (
            <div className={`text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="text-xs">({event.participants.length} selected)</span>
              <div className="text-xs mt-1">
                {event.participants.slice(0, 3).map((participant, index) => (
                  <span key={participant.id}>
                    {participant.user_name}
                    {index < Math.min(event.participants.length, 3) - 1 && ', '}
                  </span>
                ))}
                {event.participants.length > 3 && (
                  <span> +{event.participants.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Additional Details */}
        {(event.meeting_time || event.vehicle || event.camera_man) && (
          <div className="pt-2 border-t border-muted">
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              {event.meeting_time && (
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Clock className="h-3 w-3" />
                  <span className={isRTL ? 'text-right' : 'text-left'}>Meeting: {event.meeting_time}</span>
                </div>
              )}
              {event.vehicle && (
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Car className="h-3 w-3" />
                  <span className={isRTL ? 'text-right' : 'text-left'}>Vehicle: {event.vehicle}</span>
                </div>
              )}
              {event.camera_man && (
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Camera className="h-3 w-3" />
                  <span className={isRTL ? 'text-right' : 'text-left'}>Camera: {event.camera_man}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Songs and Dress Details */}
        {(event.songs?.length || event.dress_details?.length) && (
          <div className="pt-2 border-t border-muted">
            <div className={`flex gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              {event.songs && event.songs.length > 0 && (
                <Button variant="outline" size="sm" className={`text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Music className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  Songs ({event.songs.length})
                </Button>
              )}
              {event.dress_details && event.dress_details.length > 0 && (
                <Button variant="outline" size="sm" className={`text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Shirt className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  Dress ({event.dress_details.length})
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex gap-2 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button variant="outline" size="sm" className={`flex-1 ${isRTL ? 'flex-row-reverse' : ''}`} onClick={() => handleViewEvent(event)}>
            <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            View
          </Button>
          <UniversalShare
            content={generateEventContent(event)}
            title={`${event.day} Event - ${event.date}`}
            filename={`quran-event-${event.day}-${event.date}.txt`}
          >
            <Button variant="outline" size="sm" className={`flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Share2 className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              Share
            </Button>
          </UniversalShare>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 sm:space-y-4 md:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className={`px-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t.parties}</h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
          {t.allPartiesInSystem}
        </p>
      </div>

      {/* Sorting Controls */}
      <Card>
        <CardContent className="p-4">
          <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t.sortBy}</span>
              <Select value={sortConfig.key || ''} onValueChange={handleSort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t.selectSortOption} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t.date}</SelectItem>
                  <SelectItem value="time">{t.time}</SelectItem>
                  <SelectItem value="duration">{t.duration}</SelectItem>
                  <SelectItem value="participants">{t.participants}</SelectItem>
                  <SelectItem value="place">{t.place}</SelectItem>
                  <SelectItem value="status">{t.status}</SelectItem>
                  <SelectItem value="created">{t.created} {t.date}</SelectItem>
                  <SelectItem value="updated">{t.updated} {t.date}</SelectItem>
                </SelectContent>
              </Select>
              {sortConfig.key && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort(sortConfig.key!)}
                  className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {getSortIcon(sortConfig.key)}
                  <span className="capitalize">
                    {sortConfig.direction === 'asc' ? 'A to Z' : 'Z to A'}
                  </span>
                </Button>
              )}
            </div>
            <div className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
              {events.length} {t.totalEvents}
              {sortConfig.key && sortConfig.direction && (
                <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-primary`}>
                  • Sorted by {sortConfig.key} ({sortConfig.direction === 'asc' ? 'A to Z' : 'Z to A'})
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className={isRTL ? 'text-right' : 'text-left'}>{t.pending} ({filterEventsByStatus('pending').length})</TabsTrigger>
          <TabsTrigger value="completed" className={isRTL ? 'text-right' : 'text-left'}>{t.completed} ({filterEventsByStatus('completed').length})</TabsTrigger>
          <TabsTrigger value="cancelled" className={isRTL ? 'text-right' : 'text-left'}>{t.cancelled} ({filterEventsByStatus('cancelled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortEvents(filterEventsByStatus('pending')).length === 0 ? (
              <div className={`col-span-full text-center py-8 text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                No pending events
              </div>
            ) : (
              sortEvents(filterEventsByStatus('pending')).map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
        </TabsContent>


        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortEvents(filterEventsByStatus('completed')).length === 0 ? (
              <div className={`col-span-full text-center py-8 text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                No completed events
              </div>
            ) : (
              sortEvents(filterEventsByStatus('completed')).map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortEvents(filterEventsByStatus('cancelled')).length === 0 ? (
              <div className={`col-span-full text-center py-8 text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                No cancelled events
              </div>
            ) : (
              sortEvents(filterEventsByStatus('cancelled')).map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Event Dialog */}
      <Dialog open={viewEventOpen} onOpenChange={setViewEventOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className={`pb-4 border-b ${isRTL ? 'text-right' : 'text-left'}`}>
            <DialogTitle className="text-2xl font-bold">Event Details</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Complete information about this event
            </DialogDescription>
          </DialogHeader>
          {eventToView && (
            <div className="space-y-6 py-4">
              {/* Event Overview */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg">
                <h3 className={`text-lg font-semibold mb-3 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>Event Overview</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <Label className="text-sm font-medium text-muted-foreground">Day & Date</Label>
                        <p className="text-base font-medium">{eventToView.day} - {formatDate(eventToView.date)}</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Clock className="h-4 w-4 text-primary" />
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <Label className="text-sm font-medium text-muted-foreground">Time & Duration</Label>
                        <p className="text-base font-medium">{eventToView.time} ({eventToView.duration} minutes)</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <Label className="text-sm font-medium text-muted-foreground">Place</Label>
                        <p className="text-base font-medium">{eventToView.place}</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Users className="h-4 w-4 text-primary" />
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <Label className="text-sm font-medium text-muted-foreground">Participants</Label>
                        <p className="text-base font-medium">{eventToView.number_of_participants} participants</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants Section */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className={`text-lg font-semibold mb-3 flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse text-right' : 'text-left'}`}>
                  <Users className="h-5 w-5" />
                  <span>Participants</span>
                </h3>
                {eventToView.participants && eventToView.participants.length > 0 ? (
                  <div className="grid gap-2">
                    {eventToView.participants.map((participant, index) => (
                      <div key={participant.id} className={`flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className={isRTL ? 'text-right' : 'text-left'}>
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
                  <div className={`text-center py-6 text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-base">No participants assigned</p>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className={`p-4 border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Label className="text-sm font-medium text-muted-foreground">Participation Type</Label>
                    <p className="text-base font-medium mt-1">{eventToView.participation_type || 'N/A'}</p>
                  </div>
                  <div className={`p-4 border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge variant={eventToView.status === 'completed' ? 'default' : 
                              eventToView.status === 'cancelled' ? 'destructive' : 
                              eventToView.status === 'confirmed' ? 'secondary' : 'outline'} className="text-sm px-3 py-1">
                        {eventToView.status.charAt(0).toUpperCase() + eventToView.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className={`p-4 border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-base font-medium mt-1">{formatDate(eventToView.created_at)}</p>
                  </div>
                  <div className={`p-4 border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                    <p className="text-base font-medium mt-1">{formatDate(eventToView.updated_at)}</p>
                  </div>
                </div>
              </div>
              
              {/* Event Reason */}
              {eventToView.event_reason && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className={`text-lg font-semibold mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>Event Reason</h3>
                  <p className={`text-base leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>{eventToView.event_reason}</p>
                </div>
              )}

              {/* Meeting Details */}
              {eventToView.meeting_date && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse text-right' : 'text-left'}`}>
                    <Calendar className="h-5 w-5" />
                    <span>Meeting Details</span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className={`p-3 bg-background border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                      <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                      <p className="text-base font-medium mt-1">{formatDate(eventToView.meeting_date)}</p>
                    </div>
                    <div className={`p-3 bg-background border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                      <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                      <p className="text-base font-medium mt-1">{eventToView.meeting_time || 'N/A'}</p>
                    </div>
                    <div className={`p-3 bg-background border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                      <Label className="text-sm font-medium text-muted-foreground">Place</Label>
                      <p className="text-base font-medium mt-1">{eventToView.place_of_meeting || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logistics */}
              {eventToView.vehicle && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse text-right' : 'text-left'}`}>
                    <Car className="h-5 w-5" />
                    <span>Logistics</span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className={`p-3 bg-background border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                      <Label className="text-sm font-medium text-muted-foreground">Vehicle</Label>
                      <p className="text-base font-medium mt-1">{eventToView.vehicle}</p>
                    </div>
                    <div className={`p-3 bg-background border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                      <Label className="text-sm font-medium text-muted-foreground">Camera Person</Label>
                      <p className="text-base font-medium mt-1">{eventToView.camera_man || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Songs */}
              {eventToView.songs && eventToView.songs.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse text-right' : 'text-left'}`}>
                    <Music className="h-5 w-5" />
                    <span>Songs Used</span>
                  </h3>
                  <div className="grid gap-2">
                    {eventToView.songs.map((song, index) => (
                      <div key={index} className={`p-3 bg-background border rounded-lg flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
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
                  <h3 className={`text-lg font-semibold mb-3 flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse text-right' : 'text-left'}`}>
                    <Shirt className="h-5 w-5" />
                    <span>Dress Details</span>
                  </h3>
                  <div className="grid gap-2">
                    {eventToView.dress_details.map((detail, index) => {
                      const labels = [t.pants, t.shirt, t.coat, t.shoes, t.whip, t.socks, t.accessories];
                      const label = labels[index] || `${t.shirt}`;
                      return (
                        <div key={index} className={`p-3 bg-background border rounded-lg flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <p className={`text-base font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{label}: {detail.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>Created</Label>
                  <p className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{formatDate(eventToView.created_at)}</p>
                </div>
                <div className="space-y-2">
                  <Label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>Last Updated</Label>
                  <p className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{formatDate(eventToView.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewEventOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}