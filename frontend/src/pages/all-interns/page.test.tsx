import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ListAllInternsPage from './page';

const mutateMock = vi.fn();
const useCurrentUserMock = vi.fn();
const useAllInternsQueryMock = vi.fn();
const useAssignInternMutationMock = vi.fn();

vi.mock('@entities/session', () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

vi.mock('@entities/mentor', () => ({
  useAllInternsQuery: () => useAllInternsQueryMock(),
  useAssignInternMutation: () => useAssignInternMutationMock(),
}));

describe('ListAllInternsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useCurrentUserMock.mockReturnValue({
      id: 'mentor-1',
      role: 'MENTOR',
    });
    useAssignInternMutationMock.mockReturnValue({
      mutate: mutateMock,
    });
    useAllInternsQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: 'intern-1',
            fullName: 'Intern One',
            email: 'intern1@click.local',
            internProfile: null,
          },
          {
            id: 'intern-2',
            fullName: 'Intern Two',
            email: 'intern2@click.local',
            internProfile: {
              id: 'profile-2',
              mentorId: 'mentor-1',
              mentor: { id: 'mentor-1', fullName: 'Mentor One', email: 'mentor1@click.local' },
              assessments: [],
            },
          },
          {
            id: 'intern-3',
            fullName: 'Intern Three',
            email: 'intern3@click.local',
            internProfile: {
              id: 'profile-3',
              mentorId: 'mentor-2',
              mentor: { id: 'mentor-2', fullName: 'Mentor Two', email: 'mentor2@click.local' },
              assessments: [],
            },
          },
        ],
        total: 3,
        page: 1,
        pageSize: 20,
      },
      isLoading: false,
      isError: false,
    });
  });

  it('renders assignment CTA states and allows assigning only unassigned interns', async () => {
    const user = userEvent.setup();
    render(<ListAllInternsPage />);

    const assignButton = screen.getByRole('button', { name: 'Добавить стажёра' });
    const assignedToYouButton = screen.getByRole('button', { name: 'Назначен вам' });
    const assignedToOtherButton = screen.getByRole('button', { name: 'Назначен другому ментору' });

    expect(assignButton).toBeEnabled();
    expect(assignedToYouButton).toBeDisabled();
    expect(assignedToOtherButton).toBeDisabled();

    await user.click(assignButton);

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith('intern-1', expect.any(Object));
  });
});
