import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntryCalendar } from '../src/components/editor/EntryCalendar';

describe('EntryCalendar', () => {
  const entries = [
    {
      id: '1',
      title: 'A',
      tags: [],
      folder: 'Inbox',
      date: '2024-06-10T10:00:00Z',
      content: 'Entry 1',
    },
    {
      id: '2',
      title: 'B',
      tags: [],
      folder: 'Inbox',
      date: '2024-06-10T12:00:00Z',
      content: 'Entry 2',
    },
    {
      id: '3',
      title: 'C',
      tags: [],
      folder: 'Inbox',
      date: '2024-06-15T10:00:00Z',
      content: 'Entry 3',
    },
  ];

  it('renders days with correct aria-label and title for entries', () => {
    render(
      <EntryCalendar
        entries={entries}
        onDateSelect={() => {}}
        initialYear={2024}
        initialMonth={5}
      />
    );
    // June 10 should have 2 entries
    const day10 = screen.getByLabelText('Show entries for 2024-06-10');
    expect(day10).toHaveAttribute('title', '2 entries');
    // June 15 should have 1 entry
    const day15 = screen.getByLabelText('Show entries for 2024-06-15');
    expect(day15).toHaveAttribute('title', '1 entry');
  });

  it('calls onDateSelect when a day is clicked', () => {
    const onDateSelect = jest.fn();
    render(
      <EntryCalendar
        entries={entries}
        onDateSelect={onDateSelect}
        initialYear={2024}
        initialMonth={5}
      />
    );
    const day10 = screen.getByLabelText('Show entries for 2024-06-10');
    fireEvent.click(day10);
    expect(onDateSelect).toHaveBeenCalledWith('2024-06-10');
  });
});
