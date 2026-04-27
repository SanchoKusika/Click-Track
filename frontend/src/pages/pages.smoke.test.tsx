import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminUsersPage } from './admin-users/page';
import { DashboardPage } from './dashboard/page';
import { MePage } from './me/page';
import { MentorInternPage } from './mentor-intern/page';

const mentorInternsData = [
  {
    id: 'intern-profile-1',
    userId: 'intern-user-1',
    mentorId: 'mentor-1',
    user: {
      id: 'intern-user-1',
      fullName: 'Intern One',
      email: 'intern1@click.local',
    },
    assessments: [],
  },
];

const mentorInternDetailData = {
  intern: {
    id: 'intern-profile-1',
    userId: 'intern-user-1',
    mentorId: 'mentor-1',
    user: {
      id: 'intern-user-1',
      fullName: 'Intern One',
      email: 'intern1@click.local',
    },
  },
  criteria: [
    {
      id: 'criterion-react',
      title: 'React Knowledge',
      description: 'Hooks and components',
      maxScore: 5,
    },
  ],
  assessments: [],
};

const leaderboardData = [
  {
    internId: 'intern-profile-1',
    userId: 'intern-user-1',
    fullName: 'Intern One',
    averageScore: 4,
    totalAssessments: 1,
  },
];

const adminUsersData = [
  {
    id: 'intern-user-1',
    email: 'intern1@click.local',
    fullName: 'Intern One',
    role: 'INTERN' as const,
    createdAt: '2026-04-02T11:04:44.276Z',
    internProfile: {
      id: 'intern-profile-1',
      mentorId: 'mentor-1',
      mentor: {
        id: 'mentor-1',
        fullName: 'Mentor One',
        email: 'mentor1@click.local',
      },
    },
  },
];

const mentorOptionsData = [
  {
    id: 'mentor-1',
    fullName: 'Mentor One',
    email: 'mentor1@click.local',
  },
];

vi.mock('@entities/mentor', () => ({
  useMentorInternsQuery: () => ({
    data: mentorInternsData,
    isLoading: false,
    error: null,
  }),
  useMentorInternDetailQuery: () => ({
    data: mentorInternDetailData,
    isLoading: false,
    error: null,
  }),
  useCreateAssessmentMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    error: null,
  }),
}));

vi.mock('@entities/intern', () => ({
  useMyAssessmentsQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useLeaderboardQuery: () => ({
    data: leaderboardData,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@entities/admin', () => ({
  useAdminUsersQuery: () => ({
    data: { items: adminUsersData, total: adminUsersData.length, page: 1, pageSize: 20 },
    isLoading: false,
    error: null,
  }),
  useMentorOptionsQuery: () => ({
    data: mentorOptionsData,
    isLoading: false,
    error: null,
  }),
  useCreateUserMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    error: null,
  }),
  useUpdateUserMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    error: null,
  }),
  useDeleteUserMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    error: null,
  }),
}));

vi.mock('@entities/session', () => ({
  useCurrentUserQuery: () => ({
    data: {
      id: 'intern-user-1',
      email: 'intern1@click.local',
      fullName: 'Intern One',
      role: 'INTERN' as const,
      createdAt: '2026-04-02T11:04:44.276Z',
    },
    isLoading: false,
    error: null,
  }),
}));

describe('Page smoke tests', () => {
  it('renders mentor dashboard intern cards', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Assigned interns/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Intern One/i).length).toBeGreaterThan(0);
  });

  it('renders mentor intern review workspace', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/intern/intern-profile-1']}>
        <Routes>
          <Route path="/dashboard/intern/:internId" element={<MentorInternPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Overall Performance/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Intern One/i).length).toBeGreaterThan(0);
  });

  it('renders intern progress and leaderboard', () => {
    render(
      <MemoryRouter>
        <MePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Intern One/i })).toBeInTheDocument();
    expect(screen.getByText(/^Leaderboard$/i)).toBeInTheDocument();
  });

  it('renders admin users management page', () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /User management/i })).toBeInTheDocument();
    expect(screen.getAllByText(/intern1@click.local/i).length).toBeGreaterThan(0);
  });
});
