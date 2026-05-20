import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';
import type { ScheduleRow } from '../../../../core/types/schedule';

interface CalendarMeetingProps {
  events: ScheduleRow[];
  onEventClick?: (event: ScheduleRow) => void;
  headerToolbar?: boolean;
}

function CalendarMeeting({
  events,
  onEventClick,
  headerToolbar = true,
}: CalendarMeetingProps) {
  const calendarEvents: EventInput[] = events
    .map((schedule) => {
      try {
        const dateParts = schedule.date.split('-').map(Number);
        let hours: number;
        let minutes: number;

        if (schedule.time.includes('AM') || schedule.time.includes('PM')) {
          const timeMatch = schedule.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!timeMatch) return null;
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
          const meridiem = timeMatch[3].toUpperCase();
          if (meridiem === 'PM' && hours !== 12) hours += 12;
          else if (meridiem === 'AM' && hours === 12) hours = 0;
        } else {
          const timeParts = schedule.time.split(':').map(Number);
          if (timeParts.length !== 2) return null;
          hours = timeParts[0];
          minutes = timeParts[1];
        }

        const [year, month, day] = dateParts;
        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) return null;

        const startDateTime = new Date(year, month - 1, day, hours, minutes);
        if (isNaN(startDateTime.getTime())) return null;
        const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000);

        return {
          id: schedule.id.toString(),
          title: `${schedule.clientType} - ${schedule.serviceType}`,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          extendedProps: { ...schedule },
          // We handle colors via renderEventContent, so keep these transparent
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      } catch {
        return null;
      }
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  function getStatusClasses(status: string): { bg: string; text: string; dot: string } {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return { bg: 'bg-success/15 hover:bg-success/25', text: 'text-success-content', dot: 'bg-success' };
      case 'PENDING':
        return { bg: 'bg-warning/15 hover:bg-warning/25', text: 'text-warning-content', dot: 'bg-warning' };
      case 'CANCELLED':
        return { bg: 'bg-error/15 hover:bg-error/25', text: 'text-error-content', dot: 'bg-error' };
      case 'COMPLETED':
        return { bg: 'bg-info/15 hover:bg-info/25', text: 'text-info-content', dot: 'bg-info' };
      default:
        return { bg: 'bg-base-300/50 hover:bg-base-300/80', text: 'text-base-content', dot: 'bg-base-content/40' };
    }
  }

  function handleEventClick(clickInfo: any) {
    const schedule = clickInfo.event.extendedProps as ScheduleRow;
    if (onEventClick) onEventClick(schedule);
  }

  function renderEventContent(eventInfo: any) {
    const schedule = eventInfo.event.extendedProps as ScheduleRow;
    const { bg, text, dot } = getStatusClasses(schedule.status);

    return (
      <div
        className={`
          w-full rounded-md px-1.5 py-0.5 cursor-pointer transition-colors duration-150
          flex items-center gap-1.5 overflow-hidden
          ${bg}
        `}
      >
        <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className={`text-[11px] font-medium truncate leading-tight ${text}`}>
          {schedule.clientEmail}
        </span>
        <span className={`ml-auto text-[10px] opacity-60 shrink-0 ${text}`}>
          {schedule.time}
        </span>
      </div>
    );
  }

  return (
    <>
      {/*
        Scoped overrides: we only reset what FullCalendar hardcodes
        and wire everything else to DaisyUI's oklch CSS vars.
        Using oklch() directly matches your theme tokens exactly.
      */}
      <style>{`
        /* ── Strip the outer scrollgrid border entirely ── */
        .mc .fc-theme-standard .fc-scrollgrid {
          border: none !important;
        }

        .fc .fc-scrollgrid-section-sticky > * {
          background: transparent;
        }

        /* Inner cell borders: only subtle horizontal lines between rows */
        .mc .fc-theme-standard td,
        .mc .fc-theme-standard th {
          border-color: color-mix(in oklch, var(--color-base-content) 8%, transparent);
        }
        /* Kill the left/right outer borders on cells in each row */
        .mc .fc-theme-standard td:first-child,
        .mc .fc-theme-standard th:first-child {
          border-left: none !important;
        }
        .mc .fc-theme-standard td:last-child,
        .mc .fc-theme-standard th:last-child {
          border-right: none !important;
        }
        /* Remove top border on header row */
        .mc .fc-col-header-cell {
          border-top: none !important;
        }

        /* ── Column headers (Lun, Mar…) ── */
        .mc .fc-col-header-cell {
          background-color: transparent;
          padding: 0.4rem 0 0.6rem;
          border-bottom: 1px solid color-mix(in oklch, var(--color-base-content) 10%, transparent) !important;
        }
        .mc .fc-col-header-cell-cushion {
          color: color-mix(in oklch, var(--color-base-content) 70%, transparent);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none !important;
        }

        /* ── Day cells ── */
        .mc .fc-daygrid-day {
          background-color: transparent;
          min-height: 100px;
        }
        .mc .fc-daygrid-day:hover {
          background-color: color-mix(in oklch, var(--color-base-content) 3%, transparent);
        }
        .mc .fc-day-other {
          background-color: transparent;
        }
        .mc .fc-day-other .fc-daygrid-day-number {
          opacity: 0.8;
        }
        .mc .fc-daygrid-day-number {
          color: color-mix(in oklch, var(--color-base-content) 70%, transparent);
          font-size: 0.78rem;
          font-weight: 500;
          padding: 0.5rem 0.6rem;
          text-decoration: none !important;
        }

        /* ── Today highlight ── */
        .mc .fc-day-today {
          background-color: color-mix(in oklch, var(--color-primary) 6%, transparent) !important;
        }
        .mc .fc-day-today .fc-daygrid-day-number {
          background-color: var(--color-primary);
          color: var(--color-primary-content);
          border-radius: 50%;
          width: 1.65rem;
          height: 1.65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin: 0.25rem;
          padding: 0;
          line-height: 1;
        }

        /* ── Events: strip ALL FC defaults ── */
        .mc .fc-event {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 2px;
        }
        .mc .fc-event:focus,
        .mc .fc-event:focus-within {
          box-shadow: none !important;
          outline: none !important;
        }
        .mc .fc-daygrid-event-harness {
          margin-bottom: 2px;
        }
        .mc .fc-daygrid-body-unbalanced .fc-daygrid-day-events {
          min-height: 2rem;
        }

        /* ── "more" link ── */
        .mc .fc-daygrid-more-link {
          color: var(--color-primary);
          font-size: 0.68rem;
          font-weight: 600;
          padding: 1px 6px;
          margin-left: 2px;
        }
        .mc .fc-daygrid-more-link:hover {
          background-color: color-mix(in oklch, var(--color-primary) 10%, transparent);
          border-radius: 4px;
        }

        /* ── Popover ── */
        .mc .fc-popover {
          background-color: var(--color-base-100);
          border: 1px solid color-mix(in oklch, var(--color-base-content) 10%, transparent);
          border-radius: var(--radius-box);
        }
        .mc .fc-popover-header {
          background-color: var(--color-base-200);
          color: var(--color-base-content);
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: var(--radius-box) var(--radius-box) 0 0;
          padding: 0.5rem 0.75rem;
        }
        .mc .fc-popover-close {
          color: color-mix(in oklch, var(--color-base-content) 45%, transparent);
        }
        .mc .fc-popover-body {
          padding: 0.5rem;
        }

        /* ── Toolbar buttons ── */
        .mc .fc-button-primary {
          background-color: transparent !important;
          border: 1px solid color-mix(in oklch, var(--color-base-content) 16%, transparent) !important;
          color: var(--color-base-content) !important;
          border-radius: var(--radius-field) !important;
          font-size: 0.78rem !important;
          font-weight: 600 !important;
          padding: 0.28rem 0.7rem !important;
          box-shadow: none !important;
          transition: all 0.15s ease !important;
        }
        .mc .fc-button-primary:hover:not(:disabled) {
          background-color: color-mix(in oklch, var(--color-base-content) 6%, transparent) !important;
          border-color: color-mix(in oklch, var(--color-base-content) 22%, transparent) !important;
        }
        .mc .fc-button-primary:not(:disabled).fc-button-active,
        .mc .fc-button-primary:not(:disabled):active {
          background-color: var(--color-primary) !important;
          border-color: var(--color-primary) !important;
          color: var(--color-primary-content) !important;
        }
        .mc .fc-button-group .fc-button-primary {
          border-radius: 0 !important;
        }
        .mc .fc-button-group .fc-button-primary:first-child {
          color: color-mix(in oklch, var(--color-base-content) 70%, transparent) !important;
          border-radius: 50% !important;
          aspect-ratio: 1;
        }
        .mc .fc-button-group .fc-button-primary:last-child {
          color: color-mix(in oklch, var(--color-base-content) 70%, transparent) !important;
          border-radius: 50% !important;
          aspect-ratio: 1;
          margin-left: 0.5rem;
        }

        /* ── Toolbar title ── */
        .mc .fc-toolbar-title {
          font-size: 0.95rem !important;
          font-weight: 700 !important;
          color: color-mix(in oklch, var(--color-base-content) 70%, transparent) !important;
          letter-spacing: -0.01em;
        }

        /* ── Toolbar layout ── */
        .mc .fc-toolbar {
          padding: 0.75rem !important;
          margin: 0 !important;
          align-items: center;
        }

        .mc .fc-header-toolbar {
          border-bottom: 1px solid color-mix(in oklch, var(--color-base-content) 10%, transparent) !important;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .mc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }
          .mc .fc-toolbar-title {
            font-size: 0.85rem !important;
          }
          .mc .fc-daygrid-day-number {
            font-size: 0.7rem;
          }
        }
      `}</style>

      <div className="mc w-full">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={
            headerToolbar
              ? { left: 'prev,next today', center: 'title', right: '' }
              : false
          }
          events={calendarEvents}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          timeZone="America/Bogota"
          height="auto"
          eventMaxStack={3}
          dayMaxEvents={true}
          moreLinkClick="popover"
          locale="es"
          firstDay={1}
          buttonText={{ today: 'Hoy' }}
        />
      </div>
    </>
  );
}

export default CalendarMeeting;