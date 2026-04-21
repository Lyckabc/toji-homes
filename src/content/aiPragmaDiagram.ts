/** Shared infra stack lines (technical labels; same in EN/KO sources). */
export const aiPragmaInfraStackLines = {
  docker: {
    req: [
      'Docker Compose',
      'Traefik (reverse proxy)',
      'Vault (secrets)',
      "cert-manager · Let's Encrypt",
    ],
    rec: ['GitHub Actions (CI/CD)', 'GHCR (registry)'],
  },
  kubernetes: {
    req: [
      'Kubernetes (kubeadm)',
      'OpenTofu (IaC)',
      'Vault + Agent Injector',
      'Traefik (Ingress)',
      'cert-manager (TLS)',
      'CSI Storage (SSD · HDD)',
    ],
    rec: ['Calico (CNI)', 'GHCR · GitHub Actions', 'Prometheus · Loki · Grafana'],
  },
  openStack: {
    req: [
      'All K8s tier items',
      'Nova · Neutron · Keystone',
      'Cinder (iSCSI block storage)',
      'Octavia (LB · Amphora)',
      'OpenStack CCM + Cinder CSI',
    ],
    rec: ['kolla-ansible (deploy)', 'Glance (image registry)'],
  },
} as const;

export type AiPragmaDiagramCopy = {
  hero: { eyebrow: string; title: string; tagline: string };
  sections: {
    agentCycle: string;
    whyBrain: string;
    architecture: string;
    components: string;
    infraStack: string;
  };
  cycles: { dev: string; office: string; feedbackLoop: string; ingest: string; rag: string };
  whyBrain: {
    withoutTag: string;
    withTag: string;
    quoteWithout: string;
    quoteWith: string;
    differentiators: { title: string; description: string }[];
  };
  arch: { layerInterface: string; layerAgents: string; layerFoundation: string };
  legend: { kw: string; desc: string; cls: 'iface' | 'core' | 'track' | 'brain' | 'auth' | 'infra' | 'lens' }[];
  infra: {
    dockerBadge: string;
    k8sBadge: string;
    openstackBadge: string;
    dataLayerHead: string;
    pillRequired: string;
    pillRecommended: string;
    pillWorkflowOpt: string;
    pillStreamOpt: string;
    legendRequired: string;
    legendRecommended: string;
    legendOptional: string;
  };
};

export const aiPragmaDiagramEn: AiPragmaDiagramCopy = {
  hero: {
    eyebrow: 'System Architecture',
    title: 'AI-Agent Project Management',
    tagline: 'Expert agents collaborate via chat · act on tickets · learn from knowledge',
  },
  sections: {
    agentCycle: 'Agent Cycle',
    whyBrain: 'Why Brain?',
    architecture: 'Architecture',
    components: 'Components',
    infraStack: 'Infra Stack',
  },
  cycles: {
    dev: 'Dev',
    office: 'Office',
    feedbackLoop: '↖ feedback loop',
    ingest: 'ingest',
    rag: 'RAG',
  },
  whyBrain: {
    withoutTag: 'Without',
    withTag: 'With Brain',
    quoteWithout: '"I have no context about your project, specs, or past decisions."',
    quoteWith:
      '"Based on your spec v2.3, ticket #142 is blocked by the auth migration agreed on 2025-03-12."',
    differentiators: [
      {
        title: 'Tri-layer Retrieval',
        description:
          'Vector (semantic similarity) + Graph (relationship traversal) + SQL (structural hierarchy) — not just "find similar text"',
      },
      {
        title: 'Structure-aware Chunking',
        description:
          'Documents parsed into hierarchy (section → paragraph → sentence); RAG returns the chunk and its parent context — richer, more accurate agent prompts',
      },
      {
        title: 'Stable Knowledge',
        description:
          'Idempotent ingestion via stable entity IDs — re-processing a document never creates duplicates or knowledge drift',
      },
      {
        title: 'Self-growing',
        description:
          'Every cycle feeds back: merged PRs, meeting summaries, and decisions are ingested — Brain grows smarter with each loop',
      },
    ],
  },
  arch: {
    layerInterface: 'Interface',
    layerAgents: 'Agents',
    layerFoundation: 'Foundation',
  },
  legend: [
    {
      kw: 'Relay',
      desc: 'Chat interface — group & DM. Agent entry point for users.',
      cls: 'iface',
    },
    {
      kw: 'Core',
      desc: 'LLM reasoning layer. Interprets intent, generates responses, decides next action.',
      cls: 'core',
    },
    {
      kw: 'Tracker',
      desc: 'Ticket & task engine. Source of truth for all work and assignments.',
      cls: 'track',
    },
    {
      kw: 'Brain',
      desc: 'Knowledge engine. Ingest pipeline ingests docs; RAG retrieves relevant context for agents.',
      cls: 'brain',
    },
    {
      kw: 'Guardian',
      desc: 'SSO & identity. Manages authentication and relationship-based access control.',
      cls: 'auth',
    },
    {
      kw: 'Infra',
      desc: 'Infrastructure orchestration — container platform, IaC, secrets management.',
      cls: 'infra',
    },
    {
      kw: 'Lens (opt)',
      desc: 'Dashboard & viewer. Optional visual interface for project & metric overview.',
      cls: 'lens',
    },
  ],
  infra: {
    dockerBadge: 'Small',
    k8sBadge: 'Medium · ★ Recommended',
    openstackBadge: 'Large',
    dataLayerHead: 'Data Layer — all scales',
    pillRequired: 'Required',
    pillRecommended: 'Recommended',
    pillWorkflowOpt: 'Workflow (opt)',
    pillStreamOpt: 'Stream (opt)',
    legendRequired: 'Required',
    legendRecommended: 'Recommended',
    legendOptional: 'Optional',
  },
};

export const aiPragmaDiagramKo: AiPragmaDiagramCopy = {
  hero: {
    eyebrow: '시스템 아키텍처',
    title: 'AI-Agent 프로젝트 관리',
    tagline: '전문가 에이전트가 채팅으로 협업하고 · 티켓을 처리하며 · 지식으로 학습합니다',
  },
  sections: {
    agentCycle: '에이전트 사이클',
    whyBrain: '왜 Brain인가?',
    architecture: '아키텍처',
    components: '구성 요소',
    infraStack: '인프라 스택',
  },
  cycles: {
    dev: '개발',
    office: '오피스',
    feedbackLoop: '↖ 피드백 루프',
    ingest: 'ingest',
    rag: 'RAG',
  },
  whyBrain: {
    withoutTag: 'Brain 없음',
    withTag: 'Brain 사용',
    quoteWithout: '"프로젝트, spec, 과거 의사결정에 대한 맥락이 없습니다."',
    quoteWith:
      '"spec v2.3 기준으로 ticket #142는 2025-03-12에 합의된 auth migration 때문에 블로킹되어 있습니다."',
    differentiators: [
      {
        title: '3계층 검색',
        description:
          'Vector(의미 유사도) + Graph(관계 탐색) + SQL(구조적 계층) — 단순히 비슷한 텍스트를 찾는 수준이 아닙니다.',
      },
      {
        title: '구조 인식 청킹',
        description:
          '문서를 계층(섹션 → 단락 → 문장)으로 파싱하고, RAG는 청크와 상위 맥락을 함께 반환해 에이전트 프롬프트를 더 풍부하고 정확하게 만듭니다.',
      },
      {
        title: '안정적 지식',
        description:
          '안정적인 entity ID 기반 멱등 수집 — 문서를 다시 처리해도 중복이나 지식 드리프트(knowledge drift)가 생기지 않습니다.',
      },
      {
        title: '자기 성장',
        description:
          '매 사이클이 피드백됩니다: 병합된 PR, 회의 요약, 의사결정이 수집되며 Brain은 루프마다 더 똑똑해집니다.',
      },
    ],
  },
  arch: {
    layerInterface: '인터페이스',
    layerAgents: '에이전트',
    layerFoundation: '기반 계층',
  },
  legend: [
    {
      kw: 'Relay',
      desc: '채팅 인터페이스 — 그룹 및 DM. 사용자가 에이전트에 진입하는 지점입니다.',
      cls: 'iface',
    },
    {
      kw: 'Core',
      desc: 'LLM 추론 계층. 의도를 해석하고, 응답을 생성하며, 다음 행동을 결정합니다.',
      cls: 'core',
    },
    {
      kw: 'Tracker',
      desc: '티켓·태스크 엔진. 모든 작업과 할당의 단일 진실 공급원(SSOT)입니다.',
      cls: 'track',
    },
    {
      kw: 'Brain',
      desc: '지식 엔진. Ingest 파이프라인이 문서를 수집하고, RAG가 에이전트에 관련 맥락을 검색합니다.',
      cls: 'brain',
    },
    {
      kw: 'Guardian',
      desc: 'SSO 및 정체성(identity). 인증과 관계 기반 접근 제어(ReBAC)를 관리합니다.',
      cls: 'auth',
    },
    {
      kw: 'Infra',
      desc: '인프라 오케스트레이션 — 컨테이너 플랫폼, IaC, 시크릿 관리.',
      cls: 'infra',
    },
    {
      kw: 'Lens (opt)',
      desc: '대시보드 및 뷰어. 프로젝트·메트릭 개요를 위한 선택적 시각 인터페이스입니다.',
      cls: 'lens',
    },
  ],
  infra: {
    dockerBadge: '소(5인이하)',
    k8sBadge: '중(100인이하) · ★ 권장',
    openstackBadge: '대규모(다중서버)',
    dataLayerHead: '데이터 계층 — 모든 규모 공통',
    pillRequired: '필수',
    pillRecommended: '권장',
    pillWorkflowOpt: 'Workflow (opt)',
    pillStreamOpt: 'Stream (opt)',
    legendRequired: '필수',
    legendRecommended: '권장',
    legendOptional: '선택',
  },
};
