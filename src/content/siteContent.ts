import { SITE_DOMAIN, siteHost } from '../lib/site';
import { aiPragmaDiagramEn, aiPragmaDiagramKo } from './aiPragmaDiagram';

export type Locale = 'ko' | 'en';

export const CONTACT_EMAIL = `lyckabc@${SITE_DOMAIN}`;
export const MAILTO = `mailto:${CONTACT_EMAIL}`;

/** TOJI GitHub org ([tojiuni](https://github.com/tojiuni)) */
export const GITHUB_ORG_URL = 'https://github.com/tojiuni';

/** Homelab / cluster service links (shared) */
export const serviceEndpoints = [
  {
    key: 'forgejo',
    href: siteHost('git'),
    name: { ko: 'Forgejo', en: 'Forgejo' },
    description: {
      ko: '셀프호스팅 Git. 소스 코드, CI/CD, 컨테이너 레지스트리.',
      en: 'Self-hosted Git. Source code, CI/CD, and container registry.',
    },
  },
  {
    key: 'vikunja',
    href: siteHost('task'),
    name: { ko: 'Vikunja', en: 'Vikunja' },
    description: {
      ko: '태스크·프로젝트 관리. 칸반과 할 일 목록.',
      en: 'Task and project management. Kanban boards and to-do lists.',
    },
  },
  {
    key: 'grafana',
    href: siteHost('grafana'),
    name: { ko: 'Grafana', en: 'Grafana' },
    description: {
      ko: '관측 스택. 메트릭·로그·트레이스를 한곳에.',
      en: 'Observability stack. Metrics, logs, and traces in one place.',
    },
  },
  {
    key: 'artifacts',
    href: siteHost('artifacts'),
    name: { ko: 'Artifact Registry', en: 'Artifact Registry' },
    description: {
      ko: 'Docker 이미지와 패키지용 아티팩트 저장소.',
      en: 'Universal artifact repository for Docker images and packages.',
    },
  },
  {
    key: 'zitadel',
    href: siteHost('auth'),
    name: { ko: 'ZITADEL', en: 'ZITADEL' },
    description: {
      ko: 'IAM. 모든 서비스용 SSO·OIDC.',
      en: 'Identity and access management. SSO and OIDC for all services.',
    },
  },
  {
    key: 'vault',
    href: siteHost('vault'),
    name: { ko: 'Vault', en: 'Vault' },
    description: {
      ko: '시크릿 관리. 자격 증명·인증서 보관.',
      en: 'Secrets management. Secure storage for credentials and certificates.',
    },
  },
] as const;

export const stackItems = [
  { label: 'OpenStack', desc: { ko: 'Dalmatian · kolla-ansible', en: 'Dalmatian · kolla-ansible' } },
  { label: 'Kubernetes', desc: { ko: 'v1.35 · Calico CNI', en: 'v1.35 · Calico CNI' } },
  { label: 'Traefik', desc: { ko: 'Ingress · TLS 종료', en: 'Ingress · TLS termination' } },
  { label: 'Cinder CSI', desc: { ko: 'SSD + HDD 퍼시스턴트 볼륨', en: 'SSD + HDD persistent volumes' } },
  { label: 'Vault', desc: { ko: 'Secrets · TOTP · AppRole', en: 'Secrets · TOTP · AppRole' } },
  { label: 'OpenTofu', desc: { ko: 'Infrastructure as Code', en: 'Infrastructure as Code' } },
] as const;

export const seo = {
  home: {
    ko: {
      title: 'TOJI | 성장과 자립을 위한 데이터 재사용',
      description: 'TOJI는 성공과 실패 데이터를 성장과 자립의 양분으로 전환합니다.',
    },
    en: {
      title: 'TOJI | Data for Growth and Independence',
      description: 'TOJI turns success and failure data into nourishment for growth and independence.',
    },
  },
  about: {
    ko: {
      title: 'TOJI | About',
      description: 'TOJI 미션, 로드맵, 그리고 만드는 것들.',
    },
    en: {
      title: 'TOJI | About',
      description: 'TOJI mission, roadmap, and what we build.',
    },
  },
  gopedia: {
    ko: {
      title: 'TOJI | gopedia',
      description: '엔터프라이즈 지식 그래프 플랫폼. 온톨로지 + RAG 기반 데이터 관리.',
    },
    en: {
      title: 'TOJI | gopedia',
      description: 'Enterprise Knowledge Graph Platform. Ontology + RAG data management.',
    },
  },
  neunexus: {
    ko: {
      title: 'TOJI | neunexus',
      description: '엔터프라이즈 IaC 관리. 인프라를 완전히 오케스트레이션합니다.',
    },
    en: {
      title: 'TOJI | neunexus',
      description: 'Enterprise Infrastructure as Code. Your infra, fully orchestrated.',
    },
  },
  aiPragma: {
    ko: {
      title: 'TOJI | ai-pragma',
      description: 'AI-Agent 기반 자동화 프로젝트 관리 시스템.',
    },
    en: {
      title: 'TOJI | ai-pragma',
      description: 'AI-Agent automated project management system.',
    },
  },
} as const;

export const ui = {
  ko: {
    nav: {
      home: '홈',
      about: '소개',
      projects: '프로젝트',
      gopedia: 'gopedia',
      neunexus: 'neunexus',
      aiPragma: 'ai-pragma',
      git: 'Git',
      enquiry: '문의',
    },
    cta: {
      exploreServices: '로드맵 보기',
      contact: '문의',
      readAbout: 'TOJI 소개',
      viewProject: '자세히',
    },
    home: {
      badge: '데이터 · 성장 · 자립',
      aboutPreviewTitle: 'About TOJI',
      projectsTitle: '프로젝트',
      servicesTitle: '서비스',
      servicesLead: '클러스터에서 실행 중인 서비스입니다. SSO로 접근할 수 있습니다.',
      stackTitle: '스택',
      stackLead: '오픈소스 인프라를 코드로 관리합니다.',
      stackBody1:
        `${SITE_DOMAIN}는 완전히 셀프호스팅된 홈랩 플랫폼입니다. OpenStack Dalmatian 위의 두 노드 Kubernetes에서 서비스가 동작합니다.`,
      stackBody2:
        '인프라는 OpenTofu로 선언하고, 시크릿은 Vault에 두며, ZITADEL OIDC로 단일 로그인을 제공합니다.',
    },
    about: {
      title: 'About TOJI',
      whatWeBuildTitle: '만드는 것',
      roadmapTitle: '로드맵',
      timelineTitle: '타임라인',
      longTermTitle: '장기 이니셔티브',
      privateNote:
        'private은 릴리스는 있으나 아직 공개되지 않았음을 뜻합니다. 다국어 페이지에서는 동일한 날짜로 KR/EN 라벨을 제공합니다.',
      contactCta: '문의하기',
    },
    projects: {
      coreFeatures: '핵심 기능',
      targetUsers: '대상 사용자 (우선순위)',
      useCases: '주요 사용 사례',
      architecture: '아키텍처 요약',
      roadmapSnapshot: '로드맵 스냅샷',
      related: '관련 프로젝트',
      demo: '데모',
      deployment: '배포 옵션',
      definitions: '정의',
      selectionGuide: '선택 가이드',
      stackLinks: '스택 진입 링크',
      deployedServices: 'Neunexus로 배포된 서비스',
      repository: '저장소',
    },
    footer: {
      brand: 'TOJI',
      contact: '연락처',
      langKo: '한국어',
      langEn: 'English',
    },
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      gopedia: 'gopedia',
      neunexus: 'neunexus',
      aiPragma: 'ai-pragma',
      git: 'Git',
      enquiry: 'Enquiry',
    },
    cta: {
      exploreServices: 'View roadmap',
      contact: 'Contact',
      readAbout: 'About TOJI',
      viewProject: 'Learn more',
    },
    home: {
      badge: 'Data · Growth · Independence',
      aboutPreviewTitle: 'About TOJI',
      projectsTitle: 'Projects',
      servicesTitle: 'Services',
      servicesLead: 'Everything running on the cluster, accessible via SSO.',
      stackTitle: 'Stack',
      stackLead: 'Built on open-source infrastructure, managed as code.',
      stackBody1:
        `${SITE_DOMAIN} is a fully self-hosted homelab platform. Every service runs on a two-node Kubernetes cluster backed by OpenStack Dalmatian for compute, network, and storage.`,
      stackBody2:
        'Infrastructure is declared with OpenTofu, secrets live in Vault, and all access is controlled by ZITADEL with OIDC single sign-on.',
    },
    about: {
      title: 'About TOJI',
      whatWeBuildTitle: 'What We Build',
      roadmapTitle: 'Roadmap',
      timelineTitle: 'Timeline',
      longTermTitle: 'Long-Term Initiatives',
      privateNote:
        '`private` means the release exists but is not publicly open yet. For multilingual pages, provide KR and EN timeline labels with identical dates.',
      contactCta: 'Contact',
    },
    projects: {
      coreFeatures: 'Core Features',
      targetUsers: 'Target Users (Priority)',
      useCases: 'Primary Use Cases',
      architecture: 'Architecture Summary',
      roadmapSnapshot: 'Roadmap Snapshot',
      related: 'Related Projects',
      demo: 'Demo',
      deployment: 'Deployment Options',
      definitions: 'Definition',
      selectionGuide: 'Selection Guide',
      stackLinks: 'Stack Entry Links',
      deployedServices: 'Services Deployed with Neunexus',
      repository: 'Repository',
    },
    footer: {
      brand: 'TOJI',
      contact: 'Contact',
      langKo: '한국어',
      langEn: 'English',
    },
  },
} as const;

export const homeCopy = {
  ko: {
    headline: 'TOJI는 모든 성공과 실패를 성장과 자립을 위한 양분으로 바꿉니다.',
    subcopy: '데이터를 통해 성공과 실패를 양분으로 삼아 우리의 경제적, 사회적 자립을 지원합니다.',
    aboutSummary: '데이터를 통해 성공과 실패를 양분으로 삼아 우리의 경제적, 사회적 자립을 지원합니다.',
    projects: [
      {
        slug: 'gopedia' as const,
        title: 'gopedia',
        description: 'Enterprise Knowledge Graph Platform',
        summary: '온톨로지 + RAG 기반 데이터 관리 두뇌 프로젝트',
      },
      {
        slug: 'neunexus' as const,
        title: 'neunexus',
        description: 'enterprise Infrastructure as Code manage project',
        summary: 'Your infra, fully orchestrated.',
      },
      {
        slug: 'ai-pragma' as const,
        title: 'ai-pragma',
        description: 'AI-Agent 자동화 프로젝트 관리',
        summary: '전문가 에이전트가 채팅 협업과 티켓 실행을 반복하며 지식으로 계속 학습합니다.',
      },
    ],
  },
  en: {
    headline: 'Toji turns every success and failure into nourishment for growth and independence.',
    subcopy:
      'Through data, we turn both success and failure into nourishment to support our economic and social independence.',
    aboutSummary:
      'Through data, we turn both success and failure into nourishment to support our economic and social independence.',
    projects: [
      {
        slug: 'gopedia' as const,
        title: 'gopedia',
        description: 'Enterprise Knowledge Graph Platform',
        summary: 'Ontology + RAG based data management brain project',
      },
      {
        slug: 'neunexus' as const,
        title: 'neunexus',
        description: 'enterprise Infrastructure as Code manage project',
        summary: 'Your infra, fully orchestrated.',
      },
      {
        slug: 'ai-pragma' as const,
        title: 'ai-pragma',
        description: 'AI-Agent Automated Project Management',
        summary: 'Expert agents collaborate in chat, execute tickets, and learn through each cycle.',
      },
    ],
  },
};

export const aboutCopy = {
  ko: {
    brandStatement: 'TOJI는 모든 성공과 실패를 성장과 자립을 위한 양분으로 바꿉니다.',
    mission: '데이터를 통해 성공과 실패를 양분으로 삼아 우리의 경제적, 사회적 자립을 지원합니다.',
    whatWeBuild: [
      '경험을 재사용 가능한 지능으로 바꾸는 지식 인프라',
      '안정적인 서비스 운영을 위한 오케스트레이션 인프라',
      '자립을 위한 장기 플랫폼과 도구',
    ],
    timeline: [
      {
        date: '2026.04.04',
        label: 'gopedia 런칭 (CloudBro Ship to Production)',
        href: 'https://www.cloudbro.ai/t/ship-to-production-2-4-4-ai/3921',
      },
      {
        date: '2026.04.20',
        label: 'neunexus 런칭 (private)',
        href: null,
        internalPath: '/projects/neunexus',
      },
      { date: '2026 H2', label: '교육 지원 플랫폼 런칭', href: null },
    ],
    longTerm: [
      '경제적 자립 지원 플랫폼 런칭',
      '경제적 자립 지원 도구 런칭',
      '스마트 빌딩 관련 사업',
      '21세기 자립 관련 사업',
    ],
  },
  en: {
    brandStatement: 'Toji turns every success and failure into nourishment for growth and independence.',
    mission:
      'Through data, we turn both success and failure into nourishment to support our economic and social independence.',
    whatWeBuild: [
      'Knowledge infrastructure for turning experience into reusable intelligence',
      'Orchestrated infrastructure for reliable service operations',
      'Long-term platforms and tools for self-sufficiency',
    ],
    timeline: [
      {
        date: '2026.04.04',
        label: 'gopedia launch (CloudBro Ship to Production)',
        href: 'https://www.cloudbro.ai/t/ship-to-production-2-4-4-ai/3921',
      },
      {
        date: '2026.04.20',
        label: 'neunexus launch (private)',
        href: null,
        internalPath: '/projects/neunexus',
      },
      { date: '2026 H2', label: 'education support platforms launch', href: null },
    ],
    longTerm: [
      'economic self-sufficiency support platforms launch',
      'economic self-sufficiency support tools launch',
      'Smart building related business',
      '21st self-sufficiency related business',
    ],
  },
};

export const gopediaCopy = {
  ko: {
    oneLiner: 'Enterprise Knowledge Graph Platform',
    repo: 'https://github.com/tojiuni/gopedia',
    features: ['ingest', 'rag', 'ontology'],
    users: ['Enterprise', 'Team', 'Individual'],
    useCases: [
      '분산·비정형 데이터를 단일 진실 공급원으로 통합',
      '토큰 효율을 위한 계층형 검색(L1/L2/L3) 기반 밀집 질의·생성',
      '코드·위키·티켓·회의록 등 개발/문서/이슈 통합과 관계 추론·계층 검색',
      '머신·세그먼트별 대규모 인프라 운영 컨텍스트 검색',
    ],
    architecture: [
      '라이프사이클: Root → Stem → Rhizome → Leaf/Fruit',
      '파이프라인: phloem-flow(수집), xylem-flow(RAG/질의)',
      '계약·전송: gRPC / Protobuf',
      '스토리지: PostgreSQL, TypeDB, Qdrant, ClickHouse',
      '인가: SpiceDB (ReBAC)',
    ],
    roadmap: [
      'markdown·code 포맷 MVP 완료 검증',
      '4월 말까지: 기존 기능 품질 개선',
      '5월 초: 추가 포맷 적용 시작',
    ],
    related: [
      { label: 'Gardener', href: 'https://github.com/tojiuni/gardener_gopedia' },
      { label: 'MCP integration', href: 'https://github.com/tojiuni/gopedia_mcp' },
    ],
    demo: '데모 자산: 영상 사용 가능',
  },
  en: {
    oneLiner: 'Enterprise Knowledge Graph Platform',
    repo: 'https://github.com/tojiuni/gopedia',
    features: ['ingest', 'rag', 'ontology'],
    users: ['Enterprise', 'Team', 'Individual'],
    useCases: [
      'Distributed and unstructured data integration into a single source of truth',
      'Dense query and generation with layered retrieval (L1/L2/L3) for token efficiency',
      'Dev/docs/issues integration (code repos, wiki, tickets, meeting notes) with relationship inference and hierarchical search',
      'Large-scale infrastructure operations context retrieval by machine and segment',
    ],
    architecture: [
      'Lifecycle: Root → Stem → Rhizome → Leaf/Fruit',
      'Pipeline split: phloem-flow for ingestion, xylem-flow for RAG/query',
      'Contract and transport: gRPC / Protobuf',
      'Polyglot storage: PostgreSQL, TypeDB, Qdrant, ClickHouse',
      'Authorization: SpiceDB (ReBAC)',
    ],
    roadmap: [
      'Verify MVP completed for markdown and code formats',
      'Through end of April: quality improvements on existing capabilities',
      'Early May: begin applying additional formats',
    ],
    related: [
      { label: 'Gardener', href: 'https://github.com/tojiuni/gardener_gopedia' },
      { label: 'MCP integration', href: 'https://github.com/tojiuni/gopedia_mcp' },
    ],
    demo: 'Demo asset status: video available',
  },
};

export const aiPragmaCopy = {
  ko: {
    oneLiner: 'AI-Agent 자동화 프로젝트 관리',
    summary: '전문가 에이전트가 채팅 협업, 티켓 실행, 지식 학습을 하나의 루프로 통합합니다.',
    highlights: [
      '채팅에서 의도 파악 후 티켓으로 자동 전환',
      '개발/QA/문서화 사이클이 연결된 에이전트 협업',
      '병합 결과와 회의 기록을 지식으로 재수집',
    ],
    devCycle: ['Chat', 'Triage', 'Ticket', 'Dev', 'PR', 'QA', 'Merge', 'Docs', 'Brain'],
    officeCycle: [
      'Chat',
      'Knowledge / HR / Meeting',
      'Brain',
      'Answer',
      'Ticket',
      'PM',
      'Assigned',
      'Report',
      'Chat',
    ],
    foundation: ['Relay (Chat Interface)', 'Core (Reasoning)', 'Tracker (Ticket Engine)', 'Brain (Ingest + RAG)'],
    diagram: aiPragmaDiagramKo,
  },
  en: {
    oneLiner: 'AI-Agent Automated Project Management',
    summary: 'Expert agents unify chat collaboration, ticket execution, and knowledge learning in one loop.',
    highlights: [
      'Convert chat intent into actionable tickets automatically',
      'Connect Dev/QA/Docs cycles through collaborating agents',
      'Re-ingest merged outcomes and meeting notes as knowledge',
    ],
    devCycle: ['Chat', 'Triage', 'Ticket', 'Dev', 'PR', 'QA', 'Merge', 'Docs', 'Brain'],
    officeCycle: [
      'Chat',
      'Knowledge / HR / Meeting',
      'Brain',
      'Answer',
      'Ticket',
      'PM',
      'Assigned',
      'Report',
      'Chat',
    ],
    foundation: ['Relay (Chat Interface)', 'Core (Reasoning)', 'Tracker (Ticket Engine)', 'Brain (Ingest + RAG)'],
    diagram: aiPragmaDiagramEn,
  },
};

const neunexusServiceLinks = [
  { label: 'OpenStack Horizon', href: siteHost('openstack') },
  { label: 'HashiCorp Vault UI', href: siteHost('vault') },
  { label: 'ZITADEL (SSO/OIDC)', href: siteHost('auth') },
  { label: 'SpiceDB (authorization)', href: siteHost('spice') },
  { label: 'Gopedia API', href: siteHost('gopedia') },
  { label: 'Gopedia MCP', href: siteHost('mcp') },
  { label: 'Langfuse (LLM observability)', href: siteHost('langfuse') },
  { label: 'Grafana dashboard', href: siteHost('grafana') },
  { label: 'Forgejo (Git server)', href: siteHost('git') },
  { label: 'Vikunja (task manager)', href: siteHost('tasks') },
  { label: 'Appsmith (low-code)', href: siteHost('apps') },
  { label: 'artifact-keeper (artifact registry)', href: siteHost('artifacts') },
] as const;

export const neunexusCopy = {
  ko: {
    tagline: 'Your infra, fully orchestrated.',
    oneLiner: 'enterprise Infrastructure as Code manage project',
    repo: 'https://github.com/tojiuni/neunexus',
    deployment: [
      'OpenStack (option): 더 넓은 OS 지원·대규모가 필요할 때 선택',
      'Kubernetes (select): 필수 선택 중 하나',
      'Docker (select): 필수 선택 중 하나',
    ],
    definitions: [
      'option: 선택 사항',
      'select: 나열된 대상 중 하나를 반드시 선택',
    ],
    selection: [
      '일일 활성 고객 50명 이상이면 Kubernetes 권장',
      '일일 활성 고객이 50명 미만이면 Docker 권장',
      '일일 활성 고객 500명 이상이고 넓은 OS 지원이 필요하면 OpenStack 권장',
    ],
    stackLinks: [
      { label: 'Kubernetes path', href: 'https://github.com/tojiuni/neunexus/tree/main/k8s' },
      { label: 'Docker path', href: 'https://github.com/tojiuni/neunexus/tree/main/docker' },
    ],
    services: neunexusServiceLinks,
  },
  en: {
    tagline: 'Your infra, fully orchestrated.',
    oneLiner: 'enterprise Infrastructure as Code manage project',
    repo: 'https://github.com/tojiuni/neunexus',
    deployment: [
      'OpenStack (option): optional selection when broader OS support and larger scale are required',
      'Kubernetes (select): one of the required selections',
      'Docker (select): one of the required selections',
    ],
    definitions: ['option: optional', 'select: must choose one from the listed select targets'],
    selection: [
      'Recommend Kubernetes if daily active customers are 50+',
      'Recommend Docker if daily active customers are below 50',
      'Recommend OpenStack if daily active customers are 500+ and broad OS support is required',
    ],
    stackLinks: [
      { label: 'Kubernetes path', href: 'https://github.com/tojiuni/neunexus/tree/main/k8s' },
      { label: 'Docker path', href: 'https://github.com/tojiuni/neunexus/tree/main/docker' },
    ],
    services: neunexusServiceLinks,
  },
};

/** English (default) has no URL prefix; Korean lives under `/ko/*`. Trailing slash on inner routes (Astro `trailingSlash: 'always'`). */
export function prefixPath(path: string, locale: Locale): string {
  const slash = (p: string) => {
    if (p === '/' || p === '/ko/' || p === '/ko') return p === '/ko' ? '/ko/' : p;
    return p.endsWith('/') ? p : `${p}/`;
  };

  if (locale === 'en') {
    if (path === '/') return '/';
    return slash(path);
  }
  if (path === '/') return '/ko/';
  return slash(`/ko${path}`);
}
