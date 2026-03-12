import '../jest.setup';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { EntryList } from '../src/components/editor/EntryList';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('EntryList', () => {
  const entries = [
    {
      id: '1',
      title: 'Pinned',
      tags: [],
      folder: 'Inbox',
      date: '2024-06-01T10:00:00Z',
      content: 'Pinned entry',
      pinned: true,
    },
    {
      id: '2',
      title: 'Normal',
      tags: [],
      folder: 'Inbox',
      date: '2024-06-02T10:00:00Z',
      content: 'Normal entry',
      pinned: false,
    },
  ];
  const filters = { text: '', tag: '', folder: '' };

  it('shows pinned entries first', () => {
    render(
      <EntryList
        entries={entries}
        filters={filters}
        onSelect={() => {}}
        search={''}
        onSearch={() => {}}
      />
    );
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Pinned');
    expect(items[1]).toHaveTextContent('Normal');
  });

  it('opens modal on entry click', () => {
    render(
      <EntryList
        entries={entries}
        filters={filters}
        onSelect={() => {}}
        search={''}
        onSearch={() => {}}
      />
    );
    const items = screen.getAllByRole('listitem');
    fireEvent.click(items[0]);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Pinned')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <EntryList
        entries={entries}
        filters={filters}
        onSelect={() => {}}
        search={''}
        onSearch={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
