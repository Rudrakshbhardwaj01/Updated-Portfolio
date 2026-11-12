---
title: "Context Engineering for Humans and Agents Alike"
date: "2026-11-12"
description: "An exploration of context engineering, context windows, context rot, and the techniques that help AI agents maintain coherence across long-horizon tasks."
category: "GenAI"
image: "/assets/context_engineering_banner.jpg"
---

# Context Engineering for Humans and Agents Alike

<img
  src="/assets/context_engineering_banner.jpg"
  alt="Collage-style banner with a crowing rooster and Wake Up badges on a blue background"
  class="context-banner"
/>

> *This article is an independent interpretation of the ideas discussed in Anthropic's [Effective Context Engineering for AI Agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents). It is not an official Anthropic publication.*

## The Rise of AI-Powered Engineering

The rise of AI-powered engineering started with the concept of **prompting**: a linear way of directing your LLM about what to do.

You give your LLM an instruction. The LLM understands it, processes it, and produces an output. You evaluate that output, and the cycle continues like that.

With the rapid, near-daily advancements in this field of technology, building with language models is becoming less about writing the best-quality prompt and more about assembling the optimal context that is most likely to generate the desired result.

## From Prompt Engineering to Context Engineering

The primary focus of prompt engineering is how to write effective prompts, namely system prompts. System prompts essentially define the LLM's role, its responsibilities, the instructions it needs to follow, and how it is expected to behave.

However, as we move towards engineering with more capable models and agents that operate over multiple turns of inference and longer time horizons, we need strategies, mechanisms, and techniques for managing the entire context of a session.

Before we move forward, let's understand two things.

**What is an agent?**

An agent, in simple terms, is an LLM equipped with tools and access to external data sources, which allows it to perform tasks, interact with its environment, and take actions beyond simply generating text.

**What is context?**

Context is essentially everything that you provide to your LLM or agent to help it understand and perform a given task. This includes instructions, conversation history, tool outputs, external data, retrieved information, and other relevant details.

**Context engineering** is the art and science of curating what goes into the limited context window from the plethora of information and context that you could provide to your agent.

<figure class="context-figure">
  <img
    src="/assets/context_engineering_1.webp"
    alt="Diagram comparing prompt engineering for single-turn queries with context engineering for agents, where possible context such as documents, tools, memory files, and instructions is curated into a limited context window"
  />
  <figcaption><em>Image source: <a href="https://www.anthropic.com/research/effective-context-engineering-for-ai-agents">Anthropic</a>.</em></figcaption>
</figure>

Although these frontier LLMs are more than capable in terms of their speed and ability to manage larger and larger volumes of data, information, and context, it is observed that LLMs, just like humans, can lose focus or hallucinate after a certain point.

The concept of **context rot** is something we need to understand. As the number of tokens in the context window increases, the model's ability to accurately recall and retrieve information from that context can decrease. This does not happen uniformly or at a fixed point, and it varies from model to model, but it is a real pattern.

Basically, when you dump a lot of information and context into your coding session or agent session, and that session runs over a long horizon of time, the model can start to forget things or make errors when it comes to retaining, carrying forward, or using intricate information. So, essentially, information loss is a problem.

Although models are getting more and more capable day by day, context still needs to be treated as a finite resource with diminishing marginal returns.

LLMs can be said to have an **attention budget**, which is a way of describing how limited a model's attention over its context is, rather than a literal component of the model. This behaviour stems, in part, from the inherent design of these models, which is based on the Transformer architecture.

*(Want to understand more about the Transformer architecture? [Read my previous blog here.](/writings/transformer))*

As the model's context length increases, its ability to capture and maintain intricate relationships between different pieces of information can become increasingly challenged. The model has to process and attend to a much larger volume of information, making it harder to consistently identify and retain the details that matter most.

## Crafting Effective Context

Given that LLMs are constrained by finite context windows and attention budgets, good context engineering means finding the smallest possible set of high-signal tokens that maximizes the likelihood of achieving the desired outcome.

Implementing this in practice is much easier said than done. But there are a few techniques that assist in the same.

### 1. System Prompts

System prompts should be extremely clear, simple, and direct, in a manner that they present ideas at the right intensity.

They should neither be so rigid and specific that they literally strip the model of its capability to reason and use its intelligence, nor so vague that they give the model the entire liberty to do whatever it wants to do.

The goal that you should be striving for is to use minimal lines to convey the optimal instructions and structure for your desired task.

<figure class="context-figure">
  <img
    src="/assets/context_engineering_2.webp"
    alt="Diagram calibrating a system prompt on a spectrum from too specific to just right to too vague, showing three example bakery-assistant system prompts"
  />
  <figcaption><em>Image source: <a href="https://www.anthropic.com/research/effective-context-engineering-for-ai-agents">Anthropic</a>.</em></figcaption>
</figure>

### 2. Naming Conventions and Folder Hierarchies

Naming conventions, folder hierarchies, timestamps, etc., all provide important signals that help these models understand how and when to utilize different pieces of information.

A well-structured environment makes it easier for agents to locate, interpret, and retrieve the information they need, without having to process unnecessary information.

## Context Engineering for Long-Horizon Tasks

Long-horizon tasks require an agent to stay coherent and goal-directed across a long sequence of actions, where the total amount of information involved can exceed the LLM's context window.

A **context window** is essentially the maximum number of tokens a model can process as context in a single interaction. It determines how much information, including instructions, conversation history, and other relevant data, the model can take into account at a given point.

Agents require specialized techniques to work around these context window size limitations.

Even if larger context windows become available in the foreseeable future, context pollution could still remain a problem. Basically, when you provide a model with a lot of data and information, it can become increasingly challenging for it to distinguish between what is important and what is redundant, potentially resulting in information loss and hallucinations.

To enable agents to work effectively across extended time horizons, there are a few techniques that address this issue.

### 1. Compaction

Compaction is basically a technique used when a model's context window is nearing its limit.

Whenever a session's context size is approaching its limit, you can use compaction. Essentially, you ask the model to create a summary-like document, documenting all the important decisions, the most critical details, architectural decisions, unresolved bugs, and implementation details while discarding the redundant stuff.

This document can later be used by the agent in a new, fresh context window to continue the task from where it left off, with minimal, though not zero, loss of important information and continuity.

### 2. Structured Note-Taking or Agentic Memory

Another approach is structured note-taking, or what is commonly referred to as agentic memory.

Basically, you ask your agent to create or maintain a separate file containing its memory and notes outside of the active context window.

What work was done, what decisions were taken, why they were taken, and so on. All these details are maintained in persistent storage outside the context window, which the agent can later retrieve and read back into a fresh context window.

This provides persistent memory with minimal overhead, allowing the agent to continue working without having to carry the entire conversation history forward. The work can just keep going.

### 3. Sub-Agent Architecture

Sub-agent architectures provide another way around context limitations.

Rather than one agent trying to keep track of an entire project and doing all the heavy lifting, specialized sub-agents can handle focused tasks, each with its own context window.

The main agent coordinates the overall high-level plan while sub-agents perform deep technical work or use tools to find relevant information.

A sub-agent might explore extensively and use tens of thousands of tokens, but it returns only a condensed, distilled summary of its work to the main agent.

This gives you a clear separation of concerns. Basically, you can keep a lot of tokens out of the main agent's context by delegating specialized tasks to independent agents.

Compaction suits tasks that need a lot of back and forth. Note-taking works well for iterative development with clear milestones, while multi-agent architectures are particularly useful for complex research and analysis tasks, where exploring in parallel pays off.

Even as these models continue to improve, the challenge of maintaining coherence across extended interactions will remain central to building more effective agents.

## Conclusion

Context engineering is gradually becoming just as important, if not more important, than prompt engineering itself. As we move towards building more capable agents that can reason, use tools, and operate over extended periods of time, simply providing them with instructions is no longer enough.

The real challenge lies in deciding what information to provide, when to provide it, and, more importantly, what information to leave out. Whether it is through carefully crafted system prompts, structured information, compaction, agentic memory, or sub-agent architectures, the underlying goal remains the same: making the most out of the limited context available to these models.

Bigger context windows and more capable models are likely to make things better, but they do not eliminate the need for good context engineering.

At the end of the day, it is not about how much information you can feed your LLM, but how effectively you can provide the right information at the right time.
