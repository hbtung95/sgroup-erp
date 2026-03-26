---
name: AI/ML Engineer
description: Prompt engineering, RAG pipelines, model fine-tuning, and AI integration patterns for SGROUP ERP
---

# AI/ML Engineer Skill — SGROUP ERP

## Role Overview
The AI/ML Engineer designs and implements AI-powered features within SGROUP ERP, including LLM integration, RAG pipelines, prompt engineering, and intelligent automation.

## Prompt Engineering

### System Prompt Design Principles
```
1. Role — Define WHO the AI is
2. Context — Provide WHAT it's working with
3. Task — Specify WHAT to do
4. Format — Define HOW to output
5. Constraints — Set BOUNDARIES
6. Examples — Show EXPECTED output (few-shot)
```

### Prompt Template for ERP Domain
```typescript
const buildPrompt = (role: string, task: string, data: string) => `
Bạn là ${role} chuyên nghiệp cho hệ thống SGROUP ERP.

## Dữ liệu
${data}

## Yêu cầu
${task}

## Quy tắc
- Trả lời bằng tiếng Việt
- Phân tích dựa trên dữ liệu cụ thể
- Đưa ra khuyến nghị thực tế, có thể triển khai
- Sử dụng format markdown với bảng và bullet points
- Nếu thiếu dữ liệu, nêu rõ những gì cần bổ sung
`;
```

### Prompt Patterns
| Pattern | Use Case | Example |
|---------|----------|---------|
| Chain-of-Thought | Complex analysis | "Hãy phân tích từng bước..." |
| Few-Shot | Consistent format | Show 2-3 examples first |
| Role-Play | Domain expertise | "Bạn là chuyên gia tài chính..." |
| Step-Back | Strategic thinking | "Trước tiên, hãy xem xét bối cảnh..." |
| Self-Consistency | Reliable output | Run 3x, take consensus |

## RAG (Retrieval-Augmented Generation)

### Architecture
```
User Query
    │
    ▼
[Query Embedding] ──vector search──> [Vector DB]
    │                                      │
    │                                      ▼
    │                              [Top-K Documents]
    │                                      │
    ▼                                      ▼
[Build Context] ←────── Retrieved Context
    │
    ▼
[LLM + Context] ──generate──> [Response]
```

### RAG Implementation for ERP
```typescript
// Simple RAG service pattern
@Injectable()
export class RagService {
  // 1. Index ERP documents
  async indexDocuments(documents: Document[]) {
    for (const doc of documents) {
      const chunks = this.splitText(doc.content, 500); // 500 char chunks
      for (const chunk of chunks) {
        const embedding = await this.embed(chunk);
        await this.vectorDb.upsert({
          id: `${doc.id}_${chunk.index}`,
          embedding,
          metadata: { source: doc.source, type: doc.type },
          text: chunk.content,
        });
      }
    }
  }

  // 2. Search relevant context
  async search(query: string, topK = 5) {
    const queryEmbedding = await this.embed(query);
    return this.vectorDb.search(queryEmbedding, topK);
  }

  // 3. Generate answer with context
  async ask(question: string) {
    const context = await this.search(question);
    const prompt = `
      Based on the following ERP data and documents:
      ${context.map(c => c.text).join('\n\n')}
      
      Answer this question: ${question}
    `;
    return this.llm.chat(prompt);
  }
}
```

### What to Index for ERP
| Source | Content | Update Frequency |
|--------|---------|-----------------|
| Prisma Schema | Database structure, relations | On migration |
| API Endpoints | Controller routes, DTOs | On deploy |
| Business Rules | Validation rules, workflows | On change |
| Sales Data | Deals, leads, activities | Daily |
| Reports | Historical reports, KPIs | Weekly |
| Documentation | User guides, process docs | On update |

## Model Selection Guide

| Model | Best For | Cost | Speed |
|-------|----------|------|-------|
| GPT-4o | Complex analysis, coding | $$$ | Medium |
| GPT-4o-mini | Chat, simple tasks | $ | Fast |
| Gemini 2.0 Flash | General purpose, Vietnamese | $ | Fast |
| Gemini 2.0 Pro | Deep reasoning | $$ | Medium |
| Claude 3.5 Sonnet | Long documents, coding | $$ | Medium |

## AI Feature Ideas for ERP

| Feature | Description | Agent | Complexity |
|---------|-------------|-------|-----------|
| Smart Lead Scoring | Auto-score leads based on history | salesAnalyst | Medium |
| Sales Forecasting | Predict monthly revenue | dataAnalyst | High |
| Auto-Reporting | Generate weekly reports from data | reportGenerator | Medium |
| Meeting Summary | Summarize client meeting notes | businessAnalyst | Low |
| Anomaly Detection | Flag unusual sales patterns | opsOptimizer | High |
| Chatbot Assistant | Answer ERP questions via chat | fullstackDev | Medium |
| Document Q&A | RAG over company documents | — | High |

## Evaluation & Testing

### LLM Output Quality Metrics
| Metric | How to Measure | Target |
|--------|---------------|--------|
| Relevance | Human eval 1-5 | ≥ 4.0 |
| Accuracy | Fact-checking | ≥ 90% |
| Format Compliance | Regex/schema validation | 100% |
| Response Time | End-to-end latency | < 5s |
| Cost per Query | Token usage tracking | < $0.01 |

### Testing Prompts
```typescript
// Golden test set — always check these
const testCases = [
  { input: "Phân tích doanh số Q1", expectedContains: ["doanh thu", "so sánh", "khuyến nghị"] },
  { input: "Tạo user story cho tính năng CRM", expectedFormat: "As a/I want/So that" },
  { input: "Đánh giá lead ABC", expectedContains: ["điểm", "khả năng chuyển đổi"] },
];
```

## Safety & Guardrails
- ✅ Always validate LLM output before displaying to user
- ✅ Sanitize any generated SQL/code before execution
- ✅ Set max token limits to control costs
- ✅ Log all AI interactions for audit
- ❌ Never pass raw user input as system prompt
- ❌ Never execute AI-generated code without review
- ❌ Never expose API keys in frontend


## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/ai-data-architecture-rules.md`. RAG Context Isolation, JSON Validated Outputs, and BigQuery ETL flows are mandatory.