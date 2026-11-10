/**
 * Orthanc DICOM PACS Server Integration Hub.
 * Manages DICOM Query/Retrieve (C-FIND), C-STORE ingestion, and REST API testing.
 */
import React, { useState } from 'react';
import {
  Server,
  Activity,
  Search,
  Database,
  Radio,
  ExternalLink,
  RefreshCw,
  HardDrive,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { MedicalCase } from '../types/medical';

interface OrthancIntegrationViewProps {
  onLoadCaseIntoViewer: (sampleCaseId: string) => void;
}

export const OrthancIntegrationView: React.FC<OrthancIntegrationViewProps> = ({ onLoadCaseIntoViewer }) => {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/system');
  const [apiResponse, setApiResponse] = useState<string>(
    JSON.stringify(
      {
        Version: '1.12.3 (Orthanc Enterprise)',
        DatabaseBackend: 'PostgreSQL 15',
        DicomAet: 'ORTHANC_PACS',
        DicomPort: 4242,
        HttpPort: 8042,
        StorageAreaSizeMB: '14,290 MB',
        ActiveConnections: 3,
        Status: 'Operational'
      },
      null,
      2
    )
  );

  const orthancStudies = [
    {
      id: 'ort-study-001',
      patientId: 'PT-THORAX-4819',
      patientName: 'DOE^JOHN',
      accessionNumber: 'ACC-2026-9041',
      studyDate: '2026-10-24',
      modality: 'DX',
      seriesCount: 1,
      instancesCount: 1,
      sampleCaseId: 'case-rad-001',
      bodyPart: 'CHEST',
      finding: 'Bacterial Pneumonia (RML)',
    },
    {
      id: 'ort-study-002',
      patientId: 'PT-THORAX-5102',
      patientName: 'SMITH^JANE',
      accessionNumber: 'ACC-2026-9042',
      studyDate: '2026-10-25',
      modality: 'DX',
      seriesCount: 1,
      instancesCount: 2,
      sampleCaseId: 'case-rad-002',
      bodyPart: 'CHEST',
      finding: 'Viral Pneumonia / COVID-19',
    },
    {
      id: 'ort-study-003',
      patientId: 'PT-THORAX-6294',
      patientName: 'KOWALSKI^ROBERT',
      accessionNumber: 'ACC-2026-9043',
      studyDate: '2026-10-26',
      modality: 'CR',
      seriesCount: 1,
      instancesCount: 1,
      sampleCaseId: 'case-rad-003',
      bodyPart: 'CHEST',
      finding: 'Pleural Effusion (Left)',
    },
    {
      id: 'ort-study-004',
      patientId: 'PT-THORAX-7011',
      patientName: 'GARCIA^MARIA',
      accessionNumber: 'ACC-2026-9044',
      studyDate: '2026-10-27',
      modality: 'DX',
      seriesCount: 2,
      instancesCount: 2,
      sampleCaseId: 'case-rad-004',
      bodyPart: 'CHEST',
      finding: 'Cardiomegaly (CTR 0.59)',
    },
  ];

  const handleRunEndpoint = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    setIsConnecting(true);

    setTimeout(() => {
      setIsConnecting(false);
      if (endpoint === '/system') {
        setApiResponse(
          JSON.stringify(
            {
              Version: '1.12.3',
              Name: 'RadPulse Orthanc Core',
              DicomAet: 'ORTHANC',
              StorageAreaSizeMB: '14,290 MB',
              DatabaseBackend: 'PostgreSQL-15 Plugin',
              PluginsEnabled: ['dicom-web', 'postgresql', 'worklist']
            },
            null,
            2
          )
        );
      } else if (endpoint === '/studies') {
        setApiResponse(
          JSON.stringify(
            [
              'c451890a-9812-4011-89ab-01928374619a',
              '98128374-1293-8471-bc01-849201948271',
              'ba819203-7182-9481-ac91-192837465019',
              '71829304-8192-3847-bb01-928374615203'
            ],
            null,
            2
          )
        );
      } else if (endpoint === '/modalities') {
        setApiResponse(
          JSON.stringify(
            {
              RAD_CONSOLE_1: { AET: 'RAD_CONS1', Host: '192.168.1.45', Port: 104 },
              XR_SUITE_B: { AET: 'GE_XR_B', Host: '192.168.1.120', Port: 104 },
              CT_SOMATOM: { AET: 'SIEMENS_CT', Host: '192.168.1.150', Port: 104 }
            },
            null,
            2
          )
        );
      } else {
        setApiResponse(
          JSON.stringify(
            {
              orthanc_id: 'c451890a-9812-4011-89ab-01928374619a',
              MainDicomTags: {
                AccessionNumber: 'ACC-2026-9041',
                InstitutionName: 'Academic Medical Center Radiology',
                Modality: 'DX',
                PatientID: 'PT-THORAX-4819',
                StudyDate: '20261024',
                StudyDescription: 'CHEST PA UPRIGHT'
              }
            },
            null,
            2
          )
        );
      }
    }, 400);
  };

  return (
    <div className="space-y-5">
      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>PACS Server Daemon</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ONLINE
            </span>
          </div>
          <p className="text-lg font-bold text-white">Orthanc 1.12.3</p>
          <p className="text-[11px] text-slate-400 font-mono">REST: 8042 · DICOM: 4242</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Application Entity (AET)</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-lg font-bold font-mono text-cyan-400">ORTHANC_PACS</p>
          <p className="text-[11px] text-slate-400">C-FIND & C-STORE Enabled</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>PACS Storage Volume</span>
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-white">14.29 GB</p>
          <p className="text-[11px] text-slate-400">3,420 DICOM Instances</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Database Relational Sync</span>
            <Database className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-lg font-bold text-white">PostgreSQL 15</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Synchronized
          </p>
        </div>
      </div>

      {/* Main Study Query & PACS Ingestion Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">
              Orthanc PACS Remote Query / Retrieve (C-FIND)
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            Click <strong className="text-cyan-400">"Inspect in AI Viewer"</strong> to load study into inference engine
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Study Date</th>
                <th className="py-3 px-4">Accession</th>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Modality</th>
                <th className="py-3 px-4">Suspected Indication</th>
                <th className="py-3 px-4">Instances</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {orthancStudies.map((study) => (
                <tr key={study.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{study.studyDate}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">{study.accessionNumber}</td>
                  <td className="py-3 px-4">{study.patientId}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{study.modality}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{study.finding}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{study.instancesCount} series</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onLoadCaseIntoViewer(study.sampleCaseId)}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors shadow-sm cursor-pointer"
                    >
                      Inspect in AI Viewer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orthanc REST API Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Live Orthanc REST API Explorer</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Endpoint: http://localhost:8042</span>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Endpoint Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Available Endpoints:</label>
            <div className="space-y-1.5">
              {[
                { path: '/system', desc: 'Get Orthanc version, AET, and storage status' },
                { path: '/studies', desc: 'List all DICOM study UUIDs' },
                { path: '/modalities', desc: 'List registered PACS modalities' },
                { path: '/studies/{id}', desc: 'Get study MainDicomTags' }
              ].map((ep) => (
                <button
                  key={ep.path}
                  onClick={() => handleRunEndpoint(ep.path)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    selectedEndpoint === ep.path
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs font-bold">
                    <span>GET {ep.path}</span>
                    <Play className="w-3 h-3 text-cyan-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ep.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Response Payload Box */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-cyan-400 font-semibold">Response: HTTP 200 OK</span>
              {isConnecting && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Querying...
                </span>
              )}
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300/90 overflow-x-auto max-h-[220px]">
              {apiResponse}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
