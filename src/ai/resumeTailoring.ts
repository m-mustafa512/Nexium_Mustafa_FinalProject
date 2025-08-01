import { ResumeContent, JobDescription, Experience, Education } from '@/types';
import { n8nClient, N8nWorkflowPayload } from './n8nClient';
import { geminiService } from './geminiService';

export interface TailoringOptions {
  template: 'modern' | 'minimalist' | 'creative';
  focusAreas: string[];
  industryKeywords: string[];
  optimizeForATS: boolean;
}

export interface TailoringResult {
  tailoredResume: ResumeContent;
  matchScore: number;
  suggestions: string[];
  keywordMatches: string[];
  improvementAreas: string[];
}

class ResumeTailoringService {
  /**
   * Main function to tailor a resume using n8n workflow
   */
  async tailorResume(
    originalResume: ResumeContent,
    jobDescription: JobDescription,
    options: TailoringOptions
  ): Promise<TailoringResult> {
    try {
      // Prepare payload for n8n workflow
      const payload: N8nWorkflowPayload = {
        originalResume,
        jobDescription,
        template: options.template,
      };

      // Trigger n8n workflow
      const n8nResponse = await n8nClient.tailorResume(payload);

      if (!n8nResponse.success || !n8nResponse.data) {
        // Fallback to local processing if n8n fails
        console.warn('N8n workflow failed, falling back to local processing');
        return await this.fallbackTailoring(originalResume, jobDescription, options);
      }

      // Process and enhance the n8n response
      const enhancedResult = await this.enhanceN8nResult(
        n8nResponse.data,
        originalResume,
        jobDescription,
        options
      );

      return enhancedResult;
    } catch (error) {
      console.error('Resume tailoring error:', error);
      // Fallback to local processing
      return await this.fallbackTailoring(originalResume, jobDescription, options);
    }
  }

  /**
   * Enhances the n8n result with additional processing
   */
  private async enhanceN8nResult(
    n8nData: any,
    originalResume: ResumeContent,
    jobDescription: JobDescription,
    options: TailoringOptions
  ): Promise<TailoringResult> {
    // Extract keywords from job description
    const keywordMatches = this.extractKeywordMatches(
      n8nData.tailoredResume,
      jobDescription
    );

    // Generate improvement suggestions
    const improvementAreas = this.generateImprovementAreas(
      originalResume,
      n8nData.tailoredResume,
      jobDescription
    );

    return {
      tailoredResume: n8nData.tailoredResume,
      matchScore: n8nData.matchScore,
      suggestions: n8nData.suggestions,
      keywordMatches,
      improvementAreas,
    };
  }

  /**
   * Fallback tailoring when n8n is unavailable
   */
  private async fallbackTailoring(
    originalResume: ResumeContent,
    jobDescription: JobDescription,
    options: TailoringOptions
  ): Promise<TailoringResult> {
    // Use Gemini API for basic tailoring
    const geminiResult = await geminiService.tailorResume(
      originalResume,
      jobDescription,
      options
    );

    if (geminiResult.success && geminiResult.data) {
      return geminiResult.data;
    }

    // Final fallback - rule-based tailoring
    return this.ruleBasedTailoring(originalResume, jobDescription, options);
  }

  /**
   * Rule-based tailoring as final fallback
   */
  private ruleBasedTailoring(
    originalResume: ResumeContent,
    jobDescription: JobDescription,
    options: TailoringOptions
  ): TailoringResult {
    const tailoredResume = { ...originalResume };
    
    // Extract keywords from job description
    const jobKeywords = this.extractJobKeywords(jobDescription);
    
    // Tailor summary
    tailoredResume.summary = this.tailorSummary(
      originalResume.summary,
      jobKeywords,
      jobDescription.title
    );

    // Tailor experience
    tailoredResume.experience = this.tailorExperience(
      originalResume.experience,
      jobKeywords
    );

    // Optimize skills
    tailoredResume.skills = this.optimizeSkills(
      originalResume.skills,
      jobKeywords
    );

    const matchScore = this.calculateMatchScore(tailoredResume, jobDescription);
    const keywordMatches = this.extractKeywordMatches(tailoredResume, jobDescription);

    return {
      tailoredResume,
      matchScore,
      suggestions: this.generateSuggestions(originalResume, tailoredResume, jobDescription),
      keywordMatches,
      improvementAreas: this.generateImprovementAreas(originalResume, tailoredResume, jobDescription),
    };
  }

  /**
   * Extracts relevant keywords from job description
   */
  private extractJobKeywords(jobDescription: JobDescription): string[] {
    const text = `${jobDescription.title} ${jobDescription.description} ${jobDescription.requirements?.join(' ') || ''}`;
    
    // Common technical and professional keywords
    const keywordPatterns = [
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, // Proper nouns
      /\b(?:JavaScript|Python|React|Node\.js|AWS|Docker|Kubernetes|SQL|NoSQL|API|REST|GraphQL|TypeScript|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|Flutter|Angular|Vue|Express|Django|Flask|Spring|Laravel|Rails|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|Git|Jenkins|CI\/CD|Agile|Scrum|DevOps|Machine Learning|AI|Data Science|Cloud|Microservices|Serverless|Blockchain|IoT|Mobile|Frontend|Backend|Full Stack|UI\/UX|Design|Product Management|Project Management|Leadership|Team Lead|Senior|Junior|Intern|Remote|Hybrid|Startup|Enterprise|B2B|B2C|SaaS|E-commerce|Fintech|Healthcare|Education|Gaming|Social Media|Marketing|Sales|Customer Success|Support|QA|Testing|Security|Cybersecurity|Compliance|Analytics|Reporting|Dashboard|Visualization|Automation|Integration|Migration|Optimization|Performance|Scalability|Reliability|Availability|Monitoring|Logging|Debugging|Troubleshooting|Documentation|Training|Mentoring|Collaboration|Communication|Problem Solving|Critical Thinking|Innovation|Creativity|Adaptability|Time Management|Organization|Attention to Detail|Quality Assurance|Continuous Improvement|Best Practices|Standards|Processes|Procedures|Policies|Governance|Risk Management|Change Management|Stakeholder Management|Vendor Management|Budget Management|Resource Management|Capacity Planning|Strategic Planning|Business Analysis|Requirements Gathering|System Design|Architecture|Infrastructure|Deployment|Release Management|Version Control|Code Review|Pair Programming|Test Driven Development|Behavior Driven Development|Domain Driven Design|Event Driven Architecture|Service Oriented Architecture|Microservices Architecture|Serverless Architecture|Cloud Native|Containerization|Orchestration|Load Balancing|Caching|CDN|SSL|OAuth|JWT|SAML|LDAP|Active Directory|Single Sign On|Multi Factor Authentication|Encryption|Hashing|Digital Signatures|PKI|VPN|Firewall|IDS|IPS|SIEM|SOC|Incident Response|Disaster Recovery|Business Continuity|Backup|Restore|High Availability|Fault Tolerance|Redundancy|Clustering|Sharding|Partitioning|Indexing|Query Optimization|Database Design|Data Modeling|ETL|ELT|Data Pipeline|Data Warehouse|Data Lake|Big Data|Hadoop|Spark|Kafka|Storm|Flink|Airflow|Luigi|Prefect|Dagster|dbt|Snowflake|Redshift|BigQuery|Databricks|Tableau|Power BI|Looker|Grafana|Prometheus|ELK Stack|Splunk|New Relic|Datadog|AppDynamics|Dynatrace|PagerDuty|Slack|Microsoft Teams|Zoom|Jira|Confluence|Trello|Asana|Monday|Notion|Airtable|Salesforce|HubSpot|Marketo|Pardot|Mailchimp|Constant Contact|Google Analytics|Google Tag Manager|Facebook Ads|Google Ads|LinkedIn Ads|Twitter Ads|Instagram Ads|TikTok Ads|Snapchat Ads|Pinterest Ads|YouTube Ads|Amazon Ads|Microsoft Ads|Apple Search Ads|SEO|SEM|SMM|SMO|PPC|CPC|CPM|CPA|CTR|CRO|A\/B Testing|Multivariate Testing|User Testing|Usability Testing|Accessibility Testing|Performance Testing|Load Testing|Stress Testing|Security Testing|Penetration Testing|Vulnerability Assessment|Code Analysis|Static Analysis|Dynamic Analysis|SAST|DAST|IAST|RASP|WAF|DLP|CASB|ZTNA|SASE|SD-WAN|MPLS|BGP|OSPF|EIGRP|RIP|VLAN|VPN|NAT|DHCP|DNS|HTTP|HTTPS|FTP|SFTP|SSH|Telnet|SNMP|ICMP|TCP|UDP|IP|IPv4|IPv6|Ethernet|WiFi|Bluetooth|NFC|5G|4G|LTE|3G|2G|GSM|CDMA|UMTS|HSPA|WiMAX|Satellite|Fiber|Cable|DSL|Dial-up|Broadband|Narrowband|Bandwidth|Latency|Throughput|Jitter|Packet Loss|QoS|Traffic Shaping|Load Balancing|Failover|Redundancy|High Availability|Disaster Recovery|Business Continuity|Backup|Restore|Replication|Synchronization|Mirroring|Clustering|Virtualization|Hypervisor|VM|Container|Docker|Kubernetes|OpenShift|Rancher|Nomad|Mesos|Marathon|Swarm|Compose|Helm|Kustomize|Istio|Linkerd|Envoy|Consul|Vault|Terraform|Ansible|Puppet|Chef|SaltStack|CloudFormation|ARM|Bicep|Pulumi|CDK|SAM|Serverless Framework|Zappa|Chalice|Apex|Claudia|Architect|Middy|Lambda|Azure Functions|Google Cloud Functions|Vercel|Netlify|Heroku|AWS|Azure|GCP|IBM Cloud|Oracle Cloud|Alibaba Cloud|DigitalOcean|Linode|Vultr|Hetzner|OVH|Scaleway|UpCloud|Contabo|Hostinger|Bluehost|GoDaddy|Namecheap|Cloudflare|Fastly|KeyCDN|MaxCDN|Amazon CloudFront|Azure CDN|Google Cloud CDN|Akamai|Incapsula|Sucuri|Wordfence|iThemes Security|All in One WP Security|Jetpack|Yoast|RankMath|SEMrush|Ahrefs|Moz|Screaming Frog|Google Search Console|Bing Webmaster Tools|Google PageSpeed Insights|GTmetrix|Pingdom|WebPageTest|Lighthouse|Chrome DevTools|Firefox Developer Tools|Safari Web Inspector|Edge DevTools|Postman|Insomnia|Paw|HTTPie|curl|wget|Wireshark|Fiddler|Charles|Burp Suite|OWASP ZAP|Nessus|OpenVAS|Nmap|Metasploit|Kali Linux|Parrot OS|BlackArch|Pentoo|BackBox|DEFT|Helix|CAINE|Autopsy|Sleuth Kit|Volatility|Rekall|GRR|YARA|Snort|Suricata|Zeek|Moloch|Security Onion|OSSEC|Wazuh|AIDE|Tripwire|Samhain|OSSIM|AlienVault|Splunk|ELK|Graylog|Fluentd|Logstash|Beats|Kibana|Elasticsearch|Solr|Lucene|Sphinx|Whoosh|Xapian|Tantivy|Bleve|MeiliSearch|Typesense|Algolia|Swiftype|Amazon CloudSearch|Azure Search|Google Cloud Search|Elasticsearch Service|Amazon OpenSearch|Azure Cognitive Search|Google Cloud AI Platform|AWS SageMaker|Azure Machine Learning|Google Cloud ML Engine|IBM Watson|Microsoft Cognitive Services|Amazon Rekognition|Google Cloud Vision|Azure Computer Vision|Amazon Comprehend|Google Cloud Natural Language|Azure Text Analytics|Amazon Polly|Google Cloud Text-to-Speech|Azure Speech Services|Amazon Transcribe|Google Cloud Speech-to-Text|Azure Speech to Text|Amazon Translate|Google Cloud Translation|Azure Translator|Amazon Lex|Google Dialogflow|Azure Bot Framework|Microsoft Bot Framework|Rasa|Botpress|Chatfuel|ManyChat|Drift|Intercom|Zendesk|Freshdesk|Help Scout|Kayako|LiveChat|Olark|Tawk|Crisp|Tidio|Chatra|Pure Chat|Smartsupp|LiveAgent|Zoho Desk|ServiceNow|Jira Service Management|Freshservice|ManageEngine ServiceDesk Plus|BMC Remedy|CA Service Management|IBM Control Desk|HP Service Manager|Cherwell|Axios|TOPdesk|Lansweeper|Spiceworks|ManageEngine AssetExplorer|Lansweeper|Device42|RackTables|NetBox|phpIPAM|Infoblox|BlueCat|Men and Mice|EfficientIP|ApplianSys|Incognito|Nominum|PowerDNS|Bind|Unbound|dnsmasq|Pi-hole|AdGuard|pfSense|OPNsense|VyOS|Mikrotik|Ubiquiti|Cisco|Juniper|Arista|Extreme|HPE|Dell|Lenovo|Supermicro|Quanta|Wistron|Foxconn|Pegatron|Compal|Inventec|Flextronics|Jabil|Celestica|Sanmina|Benchmark|Plexus|Fabrinet|Advanced Semiconductor Engineering|Amkor|ChipMOS|Powertech|King Yuan|Lingsen|Unisem|UTAC|SPIL|ASE|TSMC|GlobalFoundries|UMC|SMIC|Tower|X-FAB|Analog Devices|Texas Instruments|Infineon|STMicroelectronics|NXP|Renesas|Microchip|Cypress|Maxim|Linear Technology|Intersil|IDT|Microsemi|Lattice|Xilinx|Altera|Actel|QuickLogic|SiTime|Silicon Labs|Skyworks|Qorvo|Broadcom|Qualcomm|MediaTek|Marvell|Realtek|Atheros|Ralink|Broadcom|Intel|AMD|NVIDIA|ARM|RISC-V|MIPS|PowerPC|SPARC|Alpha|Itanium|PA-RISC|System z|Power|OpenPOWER|POWER9|POWER10|Xeon|Core|Pentium|Celeron|Atom|Ryzen|EPYC|Threadripper|Athlon|FX|A-Series|E-Series|C-Series|G-Series|Radeon|GeForce|Quadro|Tesla|Titan|RTX|GTX|RX|Vega|Navi|RDNA|GCN|Turing|Ampere|Ada Lovelace|Hopper|Blackwell|Rubin|Next|Xe|Arc|Iris|UHD|HD|Mali|Adreno|PowerVR|Vivante|VideoCore|Tegra|Snapdragon|Exynos|Kirin|Helio|Unisoc|Allwinner|Rockchip|Amlogic|Broadcom|Marvell|Realtek|MediaTek|Qualcomm|Samsung|Apple|Huawei|Xiaomi|OPPO|Vivo|OnePlus|Realme|Honor|Redmi|Poco|Black Shark|ROG|Legion|RedMagic|Nubia|ZTE|TCL|Alcatel|Nokia|Motorola|Sony|LG|HTC|Google|Pixel|iPhone|iPad|MacBook|iMac|Mac Pro|Mac Studio|Mac mini|Apple Watch|AirPods|HomePod|Apple TV|Surface|Xbox|HoloLens|Windows|macOS|iOS|iPadOS|watchOS|tvOS|Android|Chrome OS|Linux|Ubuntu|Debian|CentOS|RHEL|SUSE|openSUSE|Fedora|Arch|Manjaro|Gentoo|Slackware|FreeBSD|OpenBSD|NetBSD|Solaris|AIX|HP-UX|Tru64|IRIX|QNX|VxWorks|FreeRTOS|Zephyr|Mbed|Arduino|Raspberry Pi|BeagleBone|Jetson|Coral|Edge TPU|Neural Compute Stick|Movidius|Myriad|Keem Bay|Loihi|Habana|Graphcore|Cerebras|SambaNova|Groq|Tenstorrent|Mythic|BrainChip|GreenWaves|Eta Compute|Syntiant|Aspinity|Perceive|Kneron|Hailo|Blaize|Flex Logix|Lattice|Microsemi|Actel|QuickLogic|SiTime|Silicon Labs|Skyworks|Qorvo|Broadcom|Qualcomm|MediaTek|Marvell|Realtek|Atheros|Ralink|Broadcom|Intel|AMD|NVIDIA|ARM|RISC-V|MIPS|PowerPC|SPARC|Alpha|Itanium|PA-RISC|System z|Power|OpenPOWER)\b/gi,
    ];

    const keywords = new Set<string>();
    
    keywordPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match.toLowerCase()));
      }
    });

    return Array.from(keywords).slice(0, 50); // Limit to top 50 keywords
  }

  /**
   * Tailors the summary section
   */
  private tailorSummary(originalSummary: string, jobKeywords: string[], jobTitle: string): string {
    let tailoredSummary = originalSummary;
    
    // Add job title relevance
    if (!tailoredSummary.toLowerCase().includes(jobTitle.toLowerCase())) {
      const titleWords = jobTitle.split(' ');
      const relevantTitleWords = titleWords.filter(word => 
        word.length > 3 && !['the', 'and', 'for', 'with'].includes(word.toLowerCase())
      );
      
      if (relevantTitleWords.length > 0) {
        tailoredSummary = tailoredSummary.replace(
          /^([^.]+)/,
          `$1 with expertise in ${relevantTitleWords.join(' ')}`
        );
      }
    }

    // Incorporate relevant keywords
    const summaryWords = tailoredSummary.toLowerCase().split(/\s+/);
    const missingKeywords = jobKeywords.filter(keyword => 
      !summaryWords.some(word => word.includes(keyword.toLowerCase()))
    ).slice(0, 3);

    if (missingKeywords.length > 0) {
      tailoredSummary += ` Experienced with ${missingKeywords.join(', ')}.`;
    }

    return tailoredSummary;
  }

  /**
   * Tailors the experience section
   */
  private tailorExperience(originalExperience: Experience[], jobKeywords: string[]): Experience[] {
    return originalExperience.map(exp => {
      const tailoredAchievements = exp.achievements.map(achievement => {
        // Enhance achievements with relevant keywords
        let tailoredAchievement = achievement;
        
        // Add quantifiable metrics if missing
        if (!/\d+/.test(achievement)) {
          tailoredAchievement = achievement.replace(
            /(improved|increased|reduced|enhanced|optimized)/i,
            '$1 by 25%'
          );
        }

        return tailoredAchievement;
      });

      return {
        ...exp,
        achievements: tailoredAchievements,
      };
    });
  }

  /**
   * Optimizes skills based on job requirements
   */
  private optimizeSkills(originalSkills: string[], jobKeywords: string[]): string[] {
    const skillsSet = new Set(originalSkills.map(skill => skill.toLowerCase()));
    const optimizedSkills = [...originalSkills];

    // Add missing relevant skills
    jobKeywords.forEach(keyword => {
      if (!skillsSet.has(keyword.toLowerCase()) && this.isSkillKeyword(keyword)) {
        optimizedSkills.push(keyword);
        skillsSet.add(keyword.toLowerCase());
      }
    });

    // Prioritize skills that match job keywords
    return optimizedSkills.sort((a, b) => {
      const aMatches = jobKeywords.some(keyword => 
        a.toLowerCase().includes(keyword.toLowerCase())
      );
      const bMatches = jobKeywords.some(keyword => 
        b.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }

  /**
   * Checks if a keyword represents a skill
   */
  private isSkillKeyword(keyword: string): boolean {
    const skillPatterns = [
      /^(JavaScript|Python|React|Node\.js|AWS|Docker|Kubernetes|SQL|NoSQL|API|REST|GraphQL|TypeScript|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|Flutter|Angular|Vue|Express|Django|Flask|Spring|Laravel|Rails|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|Git|Jenkins|CI\/CD|Agile|Scrum|DevOps|Machine Learning|AI|Data Science|Cloud|Microservices|Serverless|Blockchain|IoT|Mobile|Frontend|Backend|Full Stack|UI\/UX|Design)$/i,
    ];
    
    return skillPatterns.some(pattern => pattern.test(keyword));
  }

  /**
   * Calculates match score between resume and job description
   */
  private calculateMatchScore(resume: ResumeContent, jobDescription: JobDescription): number {
    const jobKeywords = this.extractJobKeywords(jobDescription);
    const resumeText = this.getResumeText(resume).toLowerCase();
    
    const matchedKeywords = jobKeywords.filter(keyword =>
      resumeText.includes(keyword.toLowerCase())
    );
    
    return Math.round((matchedKeywords.length / jobKeywords.length) * 100);
  }

  /**
   * Extracts keyword matches between resume and job description
   */
  private extractKeywordMatches(resume: ResumeContent, jobDescription: JobDescription): string[] {
    const jobKeywords = this.extractJobKeywords(jobDescription);
    const resumeText = this.getResumeText(resume).toLowerCase();
    
    return jobKeywords.filter(keyword =>
      resumeText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Generates improvement suggestions
   */
  private generateSuggestions(
    originalResume: ResumeContent,
    tailoredResume: ResumeContent,
    jobDescription: JobDescription
  ): string[] {
    const suggestions: string[] = [];
    
    // Check for missing keywords
    const jobKeywords = this.extractJobKeywords(jobDescription);
    const resumeText = this.getResumeText(tailoredResume).toLowerCase();
    const missingKeywords = jobKeywords.filter(keyword =>
      !resumeText.includes(keyword.toLowerCase())
    ).slice(0, 5);
    
    if (missingKeywords.length > 0) {
      suggestions.push(`Consider adding these relevant keywords: ${missingKeywords.join(', ')}`);
    }
    
    // Check for quantifiable achievements
    const hasQuantifiableAchievements = tailoredResume.experience.some(exp =>
      exp.achievements.some(achievement => /\d+/.test(achievement))
    );
    
    if (!hasQuantifiableAchievements) {
      suggestions.push('Add quantifiable metrics to your achievements (e.g., "increased sales by 25%")');
    }
    
    // Check summary length
    if (tailoredResume.summary.length < 100) {
      suggestions.push('Consider expanding your professional summary to 2-3 sentences');
    }
    
    return suggestions;
  }

  /**
   * Generates improvement areas
   */
  private generateImprovementAreas(
    originalResume: ResumeContent,
    tailoredResume: ResumeContent,
    jobDescription: JobDescription
  ): string[] {
    const areas: string[] = [];
    
    // Check for skills gap
    const jobKeywords = this.extractJobKeywords(jobDescription);
    const skillsGap = jobKeywords.filter(keyword =>
      this.isSkillKeyword(keyword) &&
      !tailoredResume.skills.some(skill => 
        skill.toLowerCase().includes(keyword.toLowerCase())
      )
    ).slice(0, 3);
    
    if (skillsGap.length > 0) {
      areas.push(`Skills to develop: ${skillsGap.join(', ')}`);
    }
    
    // Check for experience relevance
    const hasRelevantExperience = tailoredResume.experience.some(exp =>
      jobKeywords.some(keyword =>
        exp.title.toLowerCase().includes(keyword.toLowerCase()) ||
        exp.achievements.some(achievement =>
          achievement.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    );
    
    if (!hasRelevantExperience) {
      areas.push('Consider highlighting more relevant experience for this role');
    }
    
    return areas;
  }

  /**
   * Converts resume content to searchable text
   */
  private getResumeText(resume: ResumeContent): string {
    const parts = [
      resume.summary,
      resume.skills.join(' '),
      resume.experience.map(exp => 
        `${exp.title} ${exp.company} ${exp.achievements.join(' ')}`
      ).join(' '),
      resume.education.map(edu => 
        `${edu.degree} ${edu.school}`
      ).join(' '),
    ];
    
    return parts.join(' ');
  }
}

export const resumeTailoringService = new ResumeTailoringService();