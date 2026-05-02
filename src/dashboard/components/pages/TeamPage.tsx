import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import TeamCard from '../TeamCard'
import TeamInviteModal from '../TeamInviteModal'
import TeamRequisitesModal from '../TeamRequisitesModal'

const teamMembers = [
  {
    id: 1,
    initials: 'SR',
    name: 'Still Rise',
    role: 'Руководитель',
    presence: 'active',
    chapters: 542,
    chaptersPerMonth: 43,
    teamSince: '12.01.2023',
    email: 'steve@mangadesk.local',
    cardNumber: '5536 9123 4567 8901',
    statsHref: '#',
  },
  {
    id: 2,
    initials: 'РБ',
    name: 'Роберт',
    role: 'Участник',
    presence: 'away',
    chapters: 128,
    chaptersPerMonth: 12,
    teamSince: '03.06.2024',
    email: 'robert@mangadesk.local',
    cardNumber: '4276 3801 2290 4412',
    statsHref: '#',
  },
  {
    id: 3,
    initials: 'МР',
    name: 'Мария',
    role: 'Участник',
    presence: 'offline',
    chapters: 64,
    chaptersPerMonth: 5,
    teamSince: '18.11.2023',
    email: 'maria@mangadesk.local',
    cardNumber: '2200 5544 8811 3390',
    statsHref: '#',
  },
  {
    id: 4,
    initials: 'АЛ',
    name: 'Алексей',
    role: 'Участник',
    presence: 'active',
    chapters: 210,
    chaptersPerMonth: 18,
    teamSince: '01.02.2022',
    email: 'alexey@mangadesk.local',
    cardNumber: '5469 0012 7788 3344',
    statsHref: '#',
  },
  {
    id: 5,
    initials: 'АН',
    name: 'Анна',
    role: 'Участник',
    presence: 'away',
    chapters: 89,
    chaptersPerMonth: 7,
    teamSince: '22.09.2024',
    email: 'anna@mangadesk.local',
    cardNumber: '4000 1234 5678 9010',
    statsHref: '#',
  },
  {
    id: 6,
    initials: 'ДМ',
    name: 'Дмитрий',
    role: 'Участник',
    presence: 'offline',
    chapters: 312,
    chaptersPerMonth: 24,
    teamSince: '07.05.2021',
    email: 'dmitry@mangadesk.local',
    cardNumber: '5100 9876 5432 1098',
    statsHref: '#',
  },
]

function TeamPage({ title = 'Команда' }) {
  const [detailsMember, setDetailsMember] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="chapters-page projects-page team-page">
      <div className="dashboard-toolbar projects-page-toolbar team-page-toolbar">
        <h1>{title}</h1>
        <button type="button" className="dashboard-new-btn" onClick={() => setInviteOpen(true)}>
          <UserPlus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
          <span>Пригласить</span>
        </button>
      </div>

      <div className="team-grid">
        {teamMembers.map((member) => (
          <TeamCard key={member.id} member={member} onOpenDetails={setDetailsMember} />
        ))}
      </div>

      <TeamRequisitesModal member={detailsMember} onClose={() => setDetailsMember(null)} />
      <TeamInviteModal
        open={inviteOpen}
        inviteLink="https://mangadesk.local/invite/demo-token-team"
        onClose={() => setInviteOpen(false)}
      />
    </div>
  )
}

export default TeamPage
