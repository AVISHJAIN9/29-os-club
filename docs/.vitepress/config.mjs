import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(
  defineConfig({
    title: '35-Gesture-Presenter',
    description: 'Touchless Computer Vision PDF Presentation Control Platform.',
    appearance: 'dark',
    base: '/',
    themeConfig: {
      nav: [
        { text: 'Guide', link: '/00a-project-analysis' },
        { text: 'Features', link: '/01-features' },
        { text: 'API Reference', link: '/03-api-reference' },
        { text: 'System Design', link: '/system-design/' },
        { text: 'Interview Q&A', link: '/09-interview-qa' },
        { text: 'Checklist', link: '/13-master-checklist' }
      ],
      sidebar: [
        {
          text: 'Project Overview',
          items: [
            { text: 'Project Type', link: '/00-project-type' },
            { text: 'Project Analysis', link: '/00a-project-analysis' },
            { text: 'Project Pitch', link: '/00b-project-pitch' },
            { text: 'Project Map', link: '/00-project-map' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Feature Inventory', link: '/01-features' },
            { text: 'F1: MediaPipe Landmark Pipeline', link: '/features/F1-mediapipe-hand-landmark-pipeline' },
            { text: 'F2: Touchless Slide Navigation', link: '/features/F2-touchless-slide-navigation' },
            { text: 'F3: Laser Pointer & Annotation', link: '/features/F3-virtual-laser-pointer-annotation' },
            { text: 'F4: PDF.js Vector Rendering', link: '/features/F4-pdfjs-document-rendering-canvas' },
            { text: 'F5: Express Upload API', link: '/features/F5-express-multer-presentation-upload' },
            { text: 'Build Order', link: '/02-build-order' },
            { text: 'API Reference', link: '/03-api-reference' },
            { text: 'Tech Comparisons', link: '/04-tech-comparisons' }
          ]
        },
        {
          text: 'Architecture & Security',
          items: [
            { text: 'Architecture & Vision Loop', link: '/05-architecture' },
            { text: 'Camera Privacy & Security', link: '/06-security' },
            { text: 'Computer Vision & MediaPipe', link: '/07-ai-integration' },
            { text: 'Quality & Operations', link: '/08-quality-and-ops' }
          ]
        },
        {
          text: 'System Design Deep Dive',
          items: [
            { text: 'System Design Overview', link: '/system-design/' },
            { text: '14.1 Capacity Estimation', link: '/system-design/14.1-requirements-and-estimation' },
            { text: '14.2 Architecture Styles', link: '/system-design/14.2-architecture-styles' },
            { text: '14.5 Databases & Storage', link: '/system-design/14.5-databases-and-storage' },
            { text: '14.11 Security Architecture', link: '/system-design/14.11-security-architecture' },
            { text: 'Architecture Decisions (ADR)', link: '/system-design/decisions' }
          ]
        },
        {
          text: 'Interview & Quality',
          items: [
            { text: 'Interview Q&A (150+)', link: '/09-interview-qa' },
            { text: 'Gaps & Roadmap', link: '/10-gaps-and-improvements' },
            { text: 'Glossary', link: '/11-glossary' },
            { text: 'Confirm List', link: '/12-confirm-list' },
            { text: 'Master Checklist (275)', link: '/13-master-checklist' },
            { text: 'Say It Out Loud', link: '/14-say-it-out-loud' }
          ]
        }
      ],
      search: {
        provider: 'local'
      },
      outline: [2, 3]
    },
    mermaid: {
      theme: 'dark'
    },
    vite: {
      optimizeDeps: {
        include: ['mermaid', 'fastdom', 'fastdom/extensions/fastdom-promised.js']
      },
      ssr: {
        noExternal: ['mermaid', 'vitepress-plugin-mermaid', 'fastdom']
      }
    }
  })
);
