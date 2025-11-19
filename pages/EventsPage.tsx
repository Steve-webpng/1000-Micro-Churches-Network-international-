import React, { useState, memo } from 'react';
import { Event } from '../types';
import { IconMapPin, IconShare, IconList, IconCalendar } from '../components/Icons';

interface EventsPageProps {
  events: Event[];
  handleShare: (title: string, text: string, url: string) => void;
}

const EventsPage: React.FC<EventsPageProps> = ({ events, handleShare }) => {
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const eventsByDate: { [key: string]: Event[] } = events.reduce((acc, event) => {
        const dateKey = new Date(event.date).toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(event);
        return acc;
    }, {} as { [key: string]: Event[] });

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)}>&larr;</button>
                <h3 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => changeMonth(1)}>&rarr;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="border border-transparent"></div>)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
                    const dateKey = date.toISOString().split('T')[0];
                    const todaysEvents = eventsByDate[dateKey] || [];
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                        <div key={day} className={`border border-slate-200 dark:border-slate-700 h-20 sm:h-28 p-1 sm:p-2 text-left relative ${isToday ? 'bg-primary-50 dark:bg-primary-500/10' : ''}`}>
                            <span className={`text-xs sm:text-sm ${isToday ? 'font-bold text-primary-600 dark:text-primary-400' : ''}`}>{day + 1}</span>
                            <div className="mt-1 space-y-1">
                                {todaysEvents.map(event => (
                                    <div key={event.id} className="bg-primary-500 text-white text-[9px] sm:text-xs px-1 rounded truncate cursor-pointer" title={event.title}>{event.title}</div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Upcoming Events</h2>
        <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><IconList className="w-5 h-5"/></button>
            <button onClick={() => setView('calendar')} className={`p-1.5 rounded-md ${view === 'calendar' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><IconCalendar className="w-5 h-5"/></button>
        </div>
      </div>
      
      {view === 'list' ? (
        events.length > 0 ? (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition group">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">{event.title}</h3>
                  <div className="flex flex-wrap items-center text-slate-500 dark:text-slate-400 text-sm mt-1 gap-x-4 gap-y-1">
                    <span>📅 {new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span>📍 {event.location}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 line-clamp-2">{event.description}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto self-center pt-4 md:pt-0">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center gap-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                    <IconMapPin className="w-4 h-4" /> Map
                  </a>
                  <button onClick={() => handleShare('Upcoming Event!', `${event.title} on ${event.date}`, `https://1000micro.church/event/${event.id}`)} className="flex-1 md:flex-none bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-primary-700 flex items-center gap-2">
                    <IconShare className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
            <IconCalendar className="w-12 h-12 text-slate-300 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Upcoming Events</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Check back soon for new events.</p>
          </div>
        )
      ) : (
        <CalendarView />
      )}
    </div>
  );
};

export default memo(EventsPage);
