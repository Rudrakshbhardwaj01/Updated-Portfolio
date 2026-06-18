---
title: "Understanding Self-Attention from First Principles"
date: "2026-06-18"
description: "A first-principles walkthrough of self-attention—from static embeddings and manual context weighting to Query, Key, and Value projections, scaled dot-product attention, and the full matrix formulation behind modern Transformers."
category: "Deep Learning"
---

# Understanding Self-Attention from First Principles

<img
  src="/assets/self_attention.png"
  alt="Self Attention Banner"
  class="self-attention"
/>

Ever since the dawn of NLP, there has been a constant pursuit of finding a way to convert human-readable text into machine-understandable numbers.

Some of the earliest strides in this direction were techniques such as One-Hot Encoding, Bag of Words (BoW), and TF-IDF. These methods were undoubtedly important milestones and laid the foundation for many advances that followed. However, each of them came with its own set of limitations. These limitations kept researchers in the field curious and motivated to develop something better than the existing solutions.

The next major milestone was the introduction of **embeddings**.

Classical embedding methods such as Word2Vec, GloVe, and FastText represented words using dense vector representations that captured meaningful semantic relationships. Unlike sparse representations such as one-hot encoding or Bag of Words, embeddings placed semantically related words closer together in vector space. They do a remarkably good job of preserving the essence of a word, phrase, or even an entire sentence within a fixed-dimensional vector space.

However, these embeddings had an important limitation: they were **static**.

Once trained, a word was assigned a single vector representation that remained unchanged regardless of the context in which the word appeared.

Because of this static nature, embeddings could inherit biases present in the training data.

Consider an embedding model trained on a dataset containing 10,000 sentences about the word *Apple*. Suppose 8,000 of those sentences refer to the fruit, while only 2,000 refer to the technology company.

As expected, the learned representation of the word *Apple* would be pulled heavily toward the fruit sense, because that is the meaning it encountered far more often during training. The technology company sense would still leave some trace in the vector, but the two meanings would be compressed into a single compromise representation, one that does not cleanly capture either usage.

The fundamental problem is not simply that one meaning dominates. The deeper problem is that both meanings are collapsed into one vector. That single vector must serve as the representation of *Apple* in every sentence, regardless of whether the surrounding context is talking about a fruit basket or a smartphone launch event.

And since these embeddings are static, there is very little they can do to adapt themselves to the context of a particular sentence. Once trained, the same vector representation is reused again and again. The world needed a solution to this problem.

What was needed was a mechanism capable of producing contextualized representations. In other words, the representation of a word should not remain fixed. Instead, it should be able to adapt itself based on the context in which that word is being used.

Ideally, the same word should be allowed to have different vector representations when it carries different meanings.

For example, consider the following two sentences:

* Apple is a red-colored fruit.
* Apple makes good phones.

Although the word *Apple* appears in both sentences, it clearly refers to two entirely different things. Therefore, the embedding generated for *Apple* in the first sentence should be different from the embedding generated for *Apple* in the second sentence.

In other words, the representation of a word should be influenced not only by the word itself but also by the words surrounding it. This is exactly what contextualized representations aim to achieve.

One of the key mechanisms that made this possible is **self-attention**.

Self-attention can be regarded as the core building block of the Transformer architecture, which in turn powers nearly all modern large language models and many of the NLP systems we use today.

And it is also the topic of this very blog.

But what exactly is self-attention?

At a high level, self-attention is a mechanism that takes static embeddings as input and produces contextualized representations as output.

For now, you can think of self-attention as a function. We provide it with a sequence of static embeddings, and it performs a series of computations internally. Once those computations are complete, it outputs a new sequence of embeddings, where each embedding has been enriched with contextual information gathered from the other words in the input sequence.

In other words, self-attention transforms static embeddings into contextualized representations.

This is precisely what allows the same word to receive different representations depending on the context in which it appears.

## A Running Example

Let us now dissect this self-attention function and take a closer look at what this mechanism really is at its core.

To build a better understanding and maintain a smoother flow throughout this blog, we will work with a running example and carry it forward as we gradually uncover the different components of self-attention.

Consider the following two phrases:

* Money bank grows
* River bank flows

These phrases may not sound particularly natural in everyday language, but they are more than sufficient for building an intuition for how self-attention works.

As you might notice, both phrases contain a common word: *bank*.

However, the word *bank* is being used in two entirely different contexts.

In the first phrase, *Money bank grows*, the word *bank* refers to a financial institution where money is stored.

In the second phrase, *River bank flows*, the word *bank* refers to the land alongside a river.

Now, had we gone down the traditional static-embedding route, the vector representation of the word *bank* would have been exactly the same in both phrases, despite the fact that the meanings are completely different.

For example, suppose our embedding model represents *bank* using the following four-dimensional vector:

$$
[0.2,\ 0.3,\ 0.4,\ 0.8]
$$

Then both occurrences of *bank* would receive this exact same representation.

Clearly, this is not an ideal situation. Even though the word is the same, its meaning changes depending on the surrounding context. Ideally, the representation of *bank* in the first phrase should be different from the representation of *bank* in the second phrase.

And this is precisely the problem that self-attention is designed to solve.

## Manually Weighting the Context

So, we abandon the idea of relying solely on static embeddings and instead adopt a new approach.

Let us zoom in on the word *bank* in both phrases.

In the phrase *Money bank grows*, the contextual embedding of the word *bank* does not come exclusively from the word *bank* itself. Instead, it can be thought of as being influenced partly by the word *money*, partly by the word *bank*, and partly by the word *grows*.

In other words, the final representation of *bank* is constructed by gathering information from all the words present in the input sequence.

To make this idea concrete, let us assign some hypothetical weights to these contributions. These weights represent how much each word contributes to the contextual meaning of *bank*. Furthermore, all of these weights must add up to 1.

For the phrase *Money bank grows*, let us assume:

* money contributes 0.2
* bank contributes 0.7
* grows contributes 0.1

Notice that:

$$
0.2 + 0.7 + 0.1 = 1
$$

Similarly, consider the phrase *River bank flows*.

Once again, the contextual embedding of *bank* is not derived solely from the word *bank*. Instead, it is influenced by all the words in the phrase.

Let us assume the following contributions:

* river contributes 0.5
* bank contributes 0.4
* flows contributes 0.1

And once again:

$$
0.5 + 0.4 + 0.1 = 1
$$

Notice something interesting here.

Although the word *bank* appears in both phrases, the contributions coming from the surrounding words are different. In the first phrase, *money* exerts a stronger influence, whereas in the second phrase, *river* exerts a stronger influence.

As a result, the final contextual embedding of *bank* will be different in the two phrases, allowing the model to distinguish between the financial institution and the riverside landform.

Of course, this process is not limited to the word *bank*.

In a self-attention layer, every word computes how much it should depend on every other word in the sequence, including itself.

So, just as we calculated how much the word *bank* depends on *money*, *bank*, and *grows*, we can perform the same calculation for every other word as well.

For the phrase **Money bank grows**, let us assume the following dependencies:

| Word      | Money | Bank | Grows |
| --------- | ----- | ---- | ----- |
| **Money** | 0.6   | 0.3  | 0.1   |
| **Bank**  | 0.2   | 0.7  | 0.1   |
| **Grows** | 0.2   | 0.5  | 0.3   |

For example, the first row tells us that the contextual embedding of *money* is formed using:

* 60% information from *money* itself,
* 30% information from *bank*,
* 10% information from *grows*.

Similarly, for the phrase **River bank flows**, let us assume:

| Word      | River | Bank | Flows |
| --------- | ----- | ---- | ----- |
| **River** | 0.7   | 0.2  | 0.1   |
| **Bank**  | 0.5   | 0.4  | 0.1   |
| **Flows** | 0.3   | 0.1  | 0.6   |

Again, every row sums to 1.

These values tell us how much information each word gathers from the other words in the sequence while constructing its contextual embedding.

Notice that we are no longer asking:

> "What is the embedding of this word?"

Instead, we are asking:

> "How much information should this word collect from every other word before constructing its final contextual embedding?"

And that question lies at the heart of the self-attention mechanism.

## From Words to Embeddings

So far, we have been talking about words influencing other words. For example, we said that the word *money* depends partly on *money*, partly on *bank*, and partly on *grows*.

While this intuition is useful, words themselves are not what neural networks operate on.

A much better way of representing words in NLP is through embeddings.

Therefore, instead of saying that the contextual embedding of *money* is formed using contributions from the words *money*, *bank*, and *grows*, we can say that it is formed using contributions from the embeddings of those words.

In other words, the contextual embedding of *money* can be viewed as a weighted combination of:

* the embedding of money,
* the embedding of bank,
* and the embedding of grows.

The weights remain exactly the same as before; the only difference is that we are now applying them to embeddings rather than to the words themselves.

For example, using the dependency values we assumed earlier, the contextual embedding of money can be expressed as:

$$
\text{Context}(\text{money}) = 0.6 \cdot E_{\text{money}} + 0.3 \cdot E_{\text{bank}} + 0.1 \cdot E_{\text{grows}}
$$

where $E_{\text{money}}$, $E_{\text{bank}}$, and $E_{\text{grows}}$ denote the embedding vectors of the corresponding words.

Similarly, the contextual embedding of *bank* would be formed by taking a weighted combination of the embeddings of *money*, *bank*, and *grows* using the attention weights assigned to *bank*.

The exact same process is repeated for every word in both sentences.

This is a very important shift in perspective.

Self-attention does not directly combine words. Instead, it combines the vector representations of those words, producing a new set of embeddings that now contain contextual information from the surrounding words.

## Establishing Notation

Before progressing any further, let us establish some notation that we will use throughout the rest of this blog.

Let

$$
e_{\langle word \rangle}
$$

denote the original embedding of a word.

Similarly, let

$$
e^{new}_{\langle word \rangle}
$$

denote the new contextual embedding produced by the self-attention mechanism.

Our goal throughout the remainder of this blog is to answer a single question: how are these new embeddings calculated?

To build some intuition, let us revisit the phrase *Money bank grows*.

Using the contribution weights that we assumed earlier, the contextual embedding of the word *money* can be written as:

$$
e^{new}_{\langle money \rangle} = 0.6\,e_{\langle money \rangle} + 0.3\,e_{\langle bank \rangle} + 0.1\,e_{\langle grows \rangle}
$$

Similarly, the contextual embedding of the word *bank* can be written as:

$$
e^{new}_{\langle bank \rangle} = 0.2\,e_{\langle money \rangle} + 0.7\,e_{\langle bank \rangle} + 0.1\,e_{\langle grows \rangle}
$$

And the contextual embedding of the word *grows* becomes:

$$
e^{new}_{\langle grows \rangle} = 0.2\,e_{\langle money \rangle} + 0.5\,e_{\langle bank \rangle} + 0.3\,e_{\langle grows \rangle}
$$

Notice what is happening here.

Each new embedding is formed by taking a weighted sum of the embeddings of all the words present in the sentence. Some words contribute more, while others contribute less, but every word is allowed to influence every other word.

A quick note about the coefficients such as $0.6$, $0.3$, and $0.1$.

These values represent how much information a word chooses to gather from another word while constructing its contextual embedding. Larger values indicate a stronger influence, whereas smaller values indicate a weaker influence.

For example,

$$
e^{new}_{\langle money \rangle} = 0.6\,e_{\langle money \rangle} + 0.3\,e_{\langle bank \rangle} + 0.1\,e_{\langle grows \rangle}
$$

tells us that the new representation of *money* is influenced most heavily by its own original embedding, while also incorporating some information from *bank* and *grows*.

Throughout this blog, all embeddings $e$ will be assumed to be $n$-dimensional vectors.

The central idea to remember is that the new embedding of a word is obtained by taking a weighted combination of the embeddings of all the words in the sentence.

There is a small but important consequence of this worth noting before moving on. The coefficients $0.6$, $0.3$, and $0.1$ are not fixed properties of the word *money*. They depend on whichever words happen to be sitting alongside it. Change the surrounding words, and these weights change with them; change the weights, and the weighted combination they produce changes too. This is precisely why the same word can end up with a different contextual embedding from one sentence to the next: it is not the word that changes, but the company it keeps.

## Where Do the Weights Come From?

At this point, a natural question arises.

We have been assuming the existence of weights such as $0.6$, $0.3$, and $0.1$, but where do these values actually come from?

We still need a way to determine how much information one word should gather from another.

Intuitively, if two words are highly related in a particular context, we would like them to influence one another more strongly. Conversely, if two words are largely unrelated, their influence should be weaker.

One of the simplest and most effective ways of measuring this relationship between two vectors is the dot product.

In general, if two vectors point in similar directions in the vector space, their dot product tends to be large. Conversely, if they are dissimilar, their dot product tends to be smaller.

For now, it is useful to think of the dot product as a measure of similarity, since the embeddings we are working with at this stage are still static and untrained. Once we introduce learnable Query and Key projections later in this blog, this interpretation will need to be loosened. After training, a high dot product is better understood as a learned relevance score rather than literal semantic similarity. Two tokens can end up with a high attention score even if their original embeddings are not semantically similar at all; what matters is that the model has learned that paying attention to that interaction is useful for the task at hand.

Building on this intuition, let us attempt to compute the contextual embedding of the word *bank* using dot products directly.

A first attempt might look something like this:

$$
e^{new}_{\langle bank \rangle} = \left( e_{\langle money \rangle} \cdot e_{\langle bank \rangle}^{T} \right) e_{\langle money \rangle} + \left( e_{\langle bank \rangle} \cdot e_{\langle bank \rangle}^{T} \right) e_{\langle bank \rangle} + \left( e_{\langle grows \rangle} \cdot e_{\langle bank \rangle}^{T} \right) e_{\langle grows \rangle}
$$

Let us interpret what this equation is doing.

The term

$$
e_{\langle money \rangle} \cdot e_{\langle bank \rangle}^{T}
$$

measures the similarity between the embeddings of *money* and *bank*.

Similarly,

$$
e_{\langle bank \rangle} \cdot e_{\langle bank \rangle}^{T}
$$

measures how similar *bank* is to itself, and

$$
e_{\langle grows \rangle} \cdot e_{\langle bank \rangle}^{T}
$$

measures the similarity between *grows* and *bank*.

These similarity scores are then used to determine how much influence each embedding should have when constructing the new contextual embedding of *bank*.

Conceptually, this is very close to what we want: words that are more relevant to *bank* should contribute more to its final representation, while less relevant words should contribute less.

Let us write this a little more cleanly:

$$
e^{new}_{\langle bank \rangle} = \left[ e_{\langle money \rangle} \cdot e_{\langle bank \rangle}^{T} \right] e_{\langle money \rangle} + \left[ e_{\langle bank \rangle} \cdot e_{\langle bank \rangle}^{T} \right] e_{\langle bank \rangle} + \left[ e_{\langle grows \rangle} \cdot e_{\langle bank \rangle}^{T} \right] e_{\langle grows \rangle}
$$

Assume that the dot products inside the square brackets evaluate to the scalars $S_{21}$, $S_{22}$, and $S_{23}$ respectively.

Our equation now becomes:

$$
e^{new}_{\langle bank \rangle} = S_{21}\,e_{\langle money \rangle} + S_{22}\,e_{\langle bank \rangle} + S_{23}\,e_{\langle grows \rangle}
$$

Notice that $S_{21}$, $S_{22}$, and $S_{23}$ are scalar values. This is expected because the dot product of two vectors produces a scalar.

However, there is still a problem.

These values are not normalized. They can take on arbitrary magnitudes and are not guaranteed to sum to 1. As a result, they cannot yet be interpreted as meaningful contribution weights.

We therefore need a way to normalize them.

A very effective way of doing this is by passing these values through a Softmax function.

More specifically, we apply Softmax to the set of scores:

$$
[S_{21},\ S_{22},\ S_{23}]
$$

The Softmax function transforms these raw scores into normalized weights:

$$
[A_{21},\ A_{22},\ A_{23}]
$$

where

$$
A_{21} + A_{22} + A_{23} = 1
$$

These $A$-values can now be interpreted as contribution weights, indicating how much information the word *bank* should gather from each word in the sentence while constructing its contextual embedding. We use the symbol $A$ here, rather than $W$, to keep these attention weights clearly distinct from the projection matrices $W_Q$, $W_K$, and $W_V$ that we will introduce shortly.

Replacing the unnormalized scores with their normalized counterparts, we obtain:

$$
e^{new}_{\langle bank \rangle} = A_{21}\,e_{\langle money \rangle} + A_{22}\,e_{\langle bank \rangle} + A_{23}\,e_{\langle grows \rangle}
$$

This should look very familiar.

Earlier in the blog, we manually assumed values such as $0.2$, $0.7$, and $0.1$. We now have a mechanism for computing those values automatically. The dot products generate similarity scores, and the Softmax function converts those scores into normalized weights that can be used to construct the new contextual embedding.

## Putting It All Together

Now let us move forward.

According to our formula, the next step is straightforward.

We multiply the normalized weights $A_{21}$, $A_{22}$, and $A_{23}$ with their corresponding embeddings:

$$
A_{21}\,e_{\langle money \rangle}, \qquad A_{22}\,e_{\langle bank \rangle}, \qquad A_{23}\,e_{\langle grows \rangle}
$$

Since each $A$-value is a scalar and each embedding is an $n$-dimensional vector, the result of each multiplication is again an $n$-dimensional vector.

Once these weighted embeddings have been computed, we simply add them together:

$$
e^{new}_{\langle bank \rangle} = A_{21}\,e_{\langle money \rangle} + A_{22}\,e_{\langle bank \rangle} + A_{23}\,e_{\langle grows \rangle}
$$

The resulting vector is the new contextual embedding of the word *bank* in the phrase *Money bank grows*.

Notice what has happened.

The original embedding of *bank* has now been enriched with information gathered from the other words in the phrase. Instead of depending solely on its own static embedding, it now incorporates contextual information from *money* and *grows* as well.

This newly generated embedding is therefore context-aware and dynamic.

Of course, we do not perform this process only for the word *bank*.

The exact same procedure is repeated for every word in the input sequence. In our running example, we would similarly compute new contextual embeddings for *money* and *grows*. Likewise, for the second phrase, we would compute contextual embeddings for *river*, *bank*, and *flows*.

By the end of this process, every word in the sequence receives a new embedding that has been influenced by the words surrounding it.

And that is precisely the output produced by the self-attention mechanism.

The following diagram illustrates exactly this: each word generating its own similarity scores against every other word, passing those scores through Softmax, and then combining the embeddings accordingly to produce $y_{money}$, $y_{bank}$, and $y_{grows}$:

![Word-by-word attention computation](/assets/self_attention1.png)

A quick note on notation before moving on: $y_{\langle word \rangle}$ is simply a shorthand for $e^{new}_{\langle word \rangle}$. The two are the same object. $y$ is just a more compact way of writing the contextualized embedding once diagrams and matrix notation enter the picture, and the two notations will be used interchangeably from here on.

## Two Important Observations

I hope you are following along so far.

Using our running example, we have gradually arrived at a mechanism that looks remarkably similar to what would eventually become self-attention.

Before moving any further, let us pause for a moment and look closely at what we have just built.

There are two important observations to make about this mechanism.

### Observation 1: Everything can be computed in parallel

If you look carefully at the mechanism we have constructed so far, every computation is independent of the others.

The similarity score between one pair of embeddings can be computed without waiting for the similarity score of any other pair. Likewise, the attention weights for one word can be computed independently of the attention weights for every other word. And once those weights have been obtained, the contextual embedding of a word can be formed without needing the contextual embeddings of the remaining words.

As a result, there is no inherent sequential dependency in the computation.

Unlike recurrent architectures, which process tokens one after another, the mechanism we have built allows every word in the sequence to perform its computations simultaneously.

This means that instead of processing:

*Money → bank → grows*

one word at a time, we can process the entire sequence in parallel.

This property turns out to be extremely important.

Modern hardware such as GPUs is highly optimized for performing large numbers of mathematical operations simultaneously. Since the computations in our attention mechanism do not depend on one another, they can be expressed as matrix operations and executed very efficiently in parallel.

This parallelism is one of the key reasons attention-based architectures scale so effectively to large datasets and long sequences.

However, this advantage comes with an important trade-off.

Because every word is processed simultaneously, the mechanism itself has no built-in notion of sequence order.

From its perspective, the phrases

*Money bank grows*

and

*Grows bank money*

contain exactly the same set of embeddings.

The mechanism can determine how strongly words should influence one another, but nothing in the computations we have described so far tells it which word appeared first, second, or third.

In other words, the attention mechanism by itself does not encode positional information.

Fortunately, Transformer architectures solve this problem through a technique known as **positional encoding**, which injects information about token positions into the embeddings before attention is applied.

We will not cover positional encoding in this blog, but it is worth keeping in mind that attention alone is not sufficient for modeling word order.

## Scaling to Longer Sequences

Up until now, we have intentionally described everything from the perspective of individual words.

For example, when constructing the contextual embedding of *bank*, we manually computed similarity scores, converted those scores into attention weights, and then used those weights to form a weighted combination of embeddings.

This word-by-word view is extremely useful because it exposes the underlying intuition.

However, Observation 1 reveals something important.

None of the computations we performed actually need to be carried out one word at a time.

The similarity scores for all pairs of words can be computed simultaneously.

The attention weights for all words can be computed simultaneously.

And the contextual embeddings for all words can be constructed simultaneously.

In practice, we therefore replace the word-by-word view with a matrix-based formulation that performs exactly the same computations for the entire sequence at once.

Matrices are not introducing a new mechanism.

They are simply a compact way of expressing the same operations we have already derived.

Recall our running example:

*Money bank grows*

We can stack the embeddings of all three words into a single embedding matrix:

$$
E =
\begin{bmatrix}
e_{\langle money \rangle} \
e_{\langle bank \rangle} \
e_{\langle grows \rangle}
\end{bmatrix}
$$

This is a $3 \times n$ matrix, where:

* $3$ is the number of words in the sequence.
* $n$ is the dimensionality of each embedding vector.

The diagram below expresses the same attention mechanism we previously built, but now in matrix form.

![Matrix dimensions through the self-attention pipeline](/assets/self_attention2.png)

### Observation 2: There are no learnable parameters

There is another interesting property of the mechanism we just constructed.

Notice that nowhere in our formulation did we introduce any trainable weights or learnable parameters. To be precise about what this claim does and does not cover: it is the *attention computation itself* (the dot products and the Softmax) that introduces no new trainable weights. The embeddings $e$ that we feed into this mechanism may very well have been learned elsewhere, for instance by a Word2Vec-style training process. The attention mechanism does not add anything on top of that; it simply operates on whatever embeddings it is given.

Because the attention computation contains no learnable parameters, it cannot adapt its behavior to a specific downstream task. It can contextualize tokens, allowing each word to gather information from the words around it, but the representations it produces are not shaped by any task-specific objective.

This matters because many real-world tasks require more than contextualization. A parameter-free attention mechanism can redistribute information that is already present in the embeddings, but it cannot learn which relationships matter for a particular task. Whether two tokens should influence each other strongly is something that needs to be learned from data. Without trainable weights, the model has no way to discover that subject-verb agreement matters for grammar, that sentiment-bearing words should dominate a sentiment-analysis decision, or that a question word should attend strongly to the span containing its answer. These are precisely the kinds of task-specific patterns that translation, summarization, sentiment analysis, and question answering depend on.

In other words, gathering information from surrounding words is a necessary first step, but without learning from data, the model has no way of knowing which of those words actually matter for the task at hand.

## The Same Embedding, Three Different Roles

Upon observing this architecture more carefully, we arrive at an important realization.

The mechanism we have built so far is capable of generating contextualized representations. However, these representations are still fairly general-purpose. They are not optimized for any particular task because the architecture contains no learnable parameters.

If we want the model's contextualized representations to be shaped by what it learns from data, then the model must be able to learn from data.

And for a model to learn from data, it needs learnable parameters.

In other words, we need to introduce weights and biases into the architecture.

Before we do that, however, let us make an interesting observation.

Notice that the same embedding of a word is being used three different times while computing its contextual embedding.

Consider the leftmost block, where we are trying to generate the contextual embedding of the word *money*, namely $y_{money}$.

![Word-by-word attention computation](/assets/self_attention1.png)

If you look closely, the embedding $e_{money}$ appears three times:

* Once in the green box,
* Once in the pink box,
* And once in the blue box.

The exact same thing happens for *bank* and *grows*.

When generating $y_{bank}$, the embedding $e_{bank}$ appears in the green box, the pink box, and the blue box.

Likewise, when generating $y_{grows}$, the embedding $e_{grows}$ appears in all three locations.

This raises an interesting question.

Why are we using the same embedding three times?

The answer is that, although all three boxes contain the same embedding, they are actually playing three completely different roles.

Looking at the leftmost block, where we are trying to generate $y_{money}$.

The green embedding is responsible for comparing itself against all other embeddings in the sentence in order to determine how relevant each of them is.

It acts as the querying vector, the representation that drives the similarity computation.

This naturally motivates the name:

**Query (Q)**

Now let us look at the pink embeddings.

The similarity score between a Query and every other token is computed by comparing the Query against the pink representations. In other words, the pink embedding is the representation against which a Query is matched. A large dot product between a Query and a pink Key indicates high relevance; a small dot product indicates low relevance.

What matters is not that a Key "has meaning" on its own, but rather that the interaction between a Query and a Key produces a meaningful relevance score.

This naturally motivates the name:

**Key (K)**

Finally, consider the blue embeddings.

Once all the similarity scores have been computed and normalized through Softmax, we obtain the attention weights.

These weights are then used to compute a weighted sum.

And what exactly are we taking the weighted sum of? The blue embeddings.

The blue embeddings are therefore the actual pieces of information that get aggregated together to form the final contextualized representation.

This motivates the final name:

**Value (V)**

So although we started with a single embedding for every word, we can think of that embedding as simultaneously playing three different conceptual roles:

* Querying other tokens for relevance,
* Being queried against to determine relevance,
* And providing information to be aggregated.

These three roles are what eventually become the Query, Key, and Value vectors used in the Transformer architecture.

> **Query (Q):** The vector that drives the similarity computation: "How relevant is each other token to me?"
>
> **Key (K):** The vector that is compared against a Query to produce a relevance score. Relevance is determined by the Query-Key interaction, not by the Key alone.
>
> **Value (V):** The vector containing the actual information that will be aggregated using the attention weights: "What information should I contribute to the final contextualized representation?"

## Why Is It Called Self-Attention?

At this point, it is worth pausing to address a question that often arises when people first encounter this mechanism.

Why is it called *self*-attention?

The answer lies in where the Queries, Keys, and Values come from.

In the mechanism we have been building, all three of these quantities are derived from the same input sequence. When we compute the contextual representation of a word in the phrase *Money bank grows*, both the query and the things being queried are tokens from that same phrase. Each token attends to all other tokens within the same sequence, including itself.

This is what the word *self* refers to. The sequence is attending to itself.

This distinguishes self-attention from cross-attention, which is used in the encoder-decoder attention layers of the original Transformer. In cross-attention, the Queries come from one sequence (for example, the sequence being generated), while the Keys and Values come from a different sequence, such as the encoded source sentence. In self-attention, all three come from the same sequence.

Keeping this distinction in mind will make the architecture of the full Transformer considerably easier to understand when you encounter it.

It is worth pausing here to make the division of labor explicit, since it is easy to wonder why we need two separate roles, Key and Value, instead of just one.

The Query asks a question: *what is relevant to me?* The Key answers on behalf of its token: *here is how to judge whether I am relevant to you.* Together, the Query and the Key determine **where** to look. They decide how much attention one token should pay to another. The Value, by contrast, determines **what** is actually retrieved once that decision has been made. You can think of the Key as an address and the Value as the content stored at that address: the Query-Key interaction is what lets a token find the right addresses to look up, but it is the Value that gets delivered once the lookup is done. Scoring relevance and supplying information are different jobs, so it makes sense that they are handled by different vectors.

The reason a Query-Key dot product is useful is not that it captures semantic similarity in any fixed sense, but that training shapes the Query and Key projection spaces so that a large dot product comes to signal learned relevance. The model is free to map two tokens into Query and Key spaces where they end up well-aligned precisely because attending to one another helps it solve the task, regardless of how similar their original embeddings looked.

If a Query vector and a Key vector produce a large dot product, the model interprets the corresponding token as being important to the querying token. Tokens receiving higher similarity scores will therefore contribute more strongly to the final contextualized representation.

It is also worth appreciating what happens during training. As the model learns, it adjusts the projection matrices $W_Q$ and $W_K$ so that tokens which should exchange information tend to develop larger Query-Key similarity scores, while tokens that are less relevant to one another tend to develop smaller scores. In other words, the dot product does not start out as a meaningful relevance signal. It becomes one as the model learns which Query-Key interactions are useful for the task at hand. This is precisely why the dot product is such a powerful mechanism at the core of attention.

So far, we are in a good position.

We have identified the three components that we would like to turn into learnable parameters: Query, Key, and Value.

However, there is still a problem.

Although we have conceptually separated the roles of Query, Key, and Value, they are all still being played by the exact same embedding vector.

For example, when computing the contextual embedding of the word *bank*, the embedding $e_{\langle bank \rangle}$ simultaneously acts as:

* the Query vector,
* the Key vector,
* and the Value vector.

This is not an ideal design.

What we want is a clear separation of concerns.

The information that helps a word ask questions does not necessarily have to be the same information that helps it answer those questions. Similarly, the information that should be aggregated into the final contextual embedding does not necessarily have to be the same information used for similarity matching.

In other words, we would like to have three separate representations:

* one dedicated to querying,
* one dedicated to matching queries,
* and one dedicated to carrying information.

At the same time, we do not want to completely discard the original embedding. After all, the original embedding already contains useful semantic information.

So the natural question becomes: how can we derive three different vectors from a single embedding?

If querying, matching, and carrying information are fundamentally different tasks, it seems unreasonable to force a single vector to perform all three roles simultaneously. What we need is a way to take that one embedding and stretch it into three specialized versions of itself, each tailored to the role it is meant to play.

Before we proceed, it is worth flagging something important.

Up until this point, we have been constructing the contextual representation of a word by taking a weighted sum of the original embeddings of the other words in the sequence. This was a deliberate simplification. The goal was to build a clear intuition for how attention weights are computed and applied, without introducing unnecessary complexity too early.

Once we introduce Query, Key, and Value vectors, the final step changes slightly. Instead of taking a weighted sum of the original embeddings, we take a weighted sum of the Value vectors. You can think of the earlier formulation as a special case of this, one where the Value vectors simply are the original embeddings. The more general version, where Values are produced by a separate learned projection, gives the model considerably more flexibility.

It is worth being explicit about what is and is not changing here. The attention mechanism itself stays exactly the same: we still compute relevance scores between tokens, we still normalize those scores with Softmax, and we still use the resulting weights to form a weighted combination. What changes is simply where those scores and that combination are computed from. Instead of comparing and combining the original embeddings directly, we first project each embedding into specialized Query, Key, and Value spaces, and then run the very same scoring-and-combining procedure on those projections. Nothing about the procedure is being replaced. It is being generalized.

A very effective way of doing this is through linear transformations.

More specifically, we take the original embedding and project it into three different vector spaces using three different matrices.

For the word *bank*, this can be written as:

$$
q_{\langle bank \rangle} = e_{\langle bank \rangle} W_Q
$$

$$
k_{\langle bank \rangle} = e_{\langle bank \rangle} W_K
$$

$$
v_{\langle bank \rangle} = e_{\langle bank \rangle} W_V
$$

where:

* $W_Q$ is the Query projection matrix,
* $W_K$ is the Key projection matrix,
* $W_V$ is the Value projection matrix.

A natural question at this point is: why use three separate matrices? Why not simply multiply the embedding by one shared matrix and reuse the result for all three roles?

The reason is that querying, matching, and carrying information are fundamentally different tasks. The projection that is most useful for determining what a word is looking for is not necessarily the same projection that is most useful for describing what a word can offer, or for determining how well two words match. Using three separate matrices gives the model the freedom to learn specialized representations for each role independently. The result is a more flexible and expressive mechanism than one that uses a single shared projection.

Notice what has happened.

We started with a single embedding $e_{\langle bank \rangle}$, but after applying three different linear transformations, we obtained three different vectors:

$$
q_{\langle bank \rangle},\quad k_{\langle bank \rangle},\quad v_{\langle bank \rangle}
$$

Each of these vectors is now free to specialize in its own task.

The following diagram illustrates this projection happening for every word in our sentence. Each embedding feeds into its own $W_Q$, $W_K$, and $W_V$ matrices to produce its own Q, K, and V vectors:

![Projecting embeddings into Query, Key, and Value vectors](/assets/self_attention4.png)

Even more importantly, the matrices $W_Q$, $W_K$, and $W_V$ are learnable parameters.

During training, the model can adjust these matrices to discover better Query, Key, and Value representations for the task at hand.

And this is precisely where learning enters the self-attention mechanism.

## Where Do These Matrices Come From?

At this point, an obvious question arises.

Where do these matrices $W_Q$, $W_K$, and $W_V$ come from?

More specifically, how do we determine the values inside these matrices?

Well, the answer is actually quite straightforward.

We are dealing with a deep learning model.

And just like most other deep learning architectures, we do not manually specify the values of these matrices. Instead, we initialize them with random values and allow the model to learn the appropriate values during training.

Initially, the matrices $W_Q$, $W_K$, and $W_V$ contain nothing more than random weights.

As training progresses, the model makes predictions, computes an error, and uses backpropagation to determine how these weights should be adjusted.

Over many iterations, the matrices gradually evolve from random transformations into meaningful transformations that help the model solve the task it is being trained for.

In practice, these matrices are updated through gradient descent alongside all other trainable parameters in the network. Over time, they learn to project embeddings into representations that are increasingly useful for the task being optimized.

Eventually, assuming successful training, the model converges towards a set of weights that produce useful Query, Key, and Value representations.

The projection matrices are shared across all tokens in the sequence rather than being learned separately for each word. A single $W_Q$, $W_K$, and $W_V$ produce every token's Query, Key, and Value vectors, which keeps the mechanism both trainable and highly scalable.

Even better, introducing these learnable matrices does not sacrifice the parallel nature of the architecture.

Once the embeddings have been assembled into a matrix, all Query vectors can be generated simultaneously through a single matrix multiplication.

The same is true for the Key vectors and the Value vectors.

In other words, despite becoming trainable, the architecture still retains one of its biggest strengths: all computations can be performed in parallel.

This ability to combine learnability with parallelism is one of the key reasons why Transformer-based architectures became so successful.

## Applying This to the Full Sentence

Now, there is one very important detail that you should pay close attention to.

The matrices $W_Q$, $W_K$, and $W_V$ are trained so that they learn how to generate the best possible Query, Key, and Value vectors from a given embedding vector.

In other words, after training, these matrices become capable of extracting the information most useful for querying, matching, and information aggregation.

One last thing.

Everything we just did for the embedding of *bank* must also be done for every other word in the sentence.

Consider our running example:

*Money bank grows*

First, we obtain the embedding vectors:

$$
e_{\langle money \rangle}, \quad e_{\langle bank \rangle}, \quad e_{\langle grows \rangle}
$$

Now, for each embedding vector, we need three new vectors:

* a Query vector,
* a Key vector,
* and a Value vector.

For example, for the word *money*:

$$
q_{\langle money \rangle} = e_{\langle money \rangle}W_Q
$$

$$
k_{\langle money \rangle} = e_{\langle money \rangle}W_K
$$

$$
v_{\langle money \rangle} = e_{\langle money \rangle}W_V
$$

The exact same process is then repeated for *bank*:

$$
q_{\langle bank \rangle} = e_{\langle bank \rangle}W_Q
$$

$$
k_{\langle bank \rangle} = e_{\langle bank \rangle}W_K
$$

$$
v_{\langle bank \rangle} = e_{\langle bank \rangle}W_V
$$

And similarly for *grows*:

$$
q_{\langle grows \rangle} = e_{\langle grows \rangle}W_Q
$$

$$
k_{\langle grows \rangle} = e_{\langle grows \rangle}W_K
$$

$$
v_{\langle grows \rangle} = e_{\langle grows \rangle}W_V
$$

However, there is something very important that often confuses people when they first encounter self-attention.

The matrices used for *money*, *bank*, and *grows* are not different matrices.

The $W_Q$ used for *money* is exactly the same $W_Q$ used for *bank*.

Likewise, the $W_Q$ used for *bank* is exactly the same $W_Q$ used for *grows*.

The same is true for $W_K$ and $W_V$.

Every word in the sequence uses the exact same Query, Key, and Value projection matrices.

The numbers inside those matrices are identical regardless of which word is being processed.

The only thing that changes is the input embedding.

As a result, starting from the three embedding vectors

$$
e_{\langle money \rangle}, \quad e_{\langle bank \rangle}, \quad e_{\langle grows \rangle}
$$

we obtain a total of nine vectors:

$$
q_{\langle money \rangle}, \quad q_{\langle bank \rangle}, \quad q_{\langle grows \rangle}
$$

$$
k_{\langle money \rangle}, \quad k_{\langle bank \rangle}, \quad k_{\langle grows \rangle}
$$

$$
v_{\langle money \rangle}, \quad v_{\langle bank \rangle}, \quad v_{\langle grows \rangle}
$$

And once we have these Query, Key, and Value vectors, the remaining procedure is exactly the same as the mechanism we developed earlier.

We compute similarity scores, normalize them using Softmax to obtain attention weights, and then use those weights to compute weighted sums of the Value vectors, ultimately producing the contextualized representations for each word. The following diagram illustrates exactly this for each word's Query vector against every Key vector in the sentence, followed by a weighted combination of the Value vectors:

![Computing attention using Q, K, and V vectors](/assets/self_attention3.png)

And that's it.

What we have just built is the self-attention mechanism.

In fact, this is fundamentally the same self-attention mechanism that is used inside modern Transformer architectures today.

The process is straightforward:

1. Start with the embedding vectors.
2. Generate the corresponding Query, Key, and Value vectors.
3. Use those Query, Key, and Value vectors to compute attention scores.
4. Convert those scores into attention weights using Softmax.
5. Use the attention weights to compute weighted sums of the Value vectors.
6. Obtain contextualized representations as the final output.

Most importantly, because the Query, Key, and Value transformations are learned from data, the resulting representations are no longer merely general-purpose contextualized representations. Instead, they become representations shaped by the training objective, adapted through optimization to capture whatever patterns the data and the objective reward, which is exactly what we set out to achieve in the first place.

## The Matrix Formulation

Everything we have discussed so far can also be represented as a single matrix computation, and this is in fact how self-attention is implemented in practice.

Instead of processing every word individually, we stack all embedding vectors together into a single embedding matrix $E$, then multiply it three times using our three learnable projection matrices:

$$
Q = EW_Q
$$

$$
K = EW_K
$$

$$
V = EW_V
$$

To make the dimensions explicit, using standard notation where $T$ denotes the number of tokens in the sequence, $d_\text{model}$ denotes the dimensionality of the input embeddings, $d_k$ denotes the dimensionality of the Query and Key vectors, and $d_v$ denotes the dimensionality of the Value vectors:

$$
E \in \mathbb{R}^{T \times d_\text{model}}
$$

$$
W_Q \in \mathbb{R}^{d_\text{model} \times d_k}, \qquad W_K \in \mathbb{R}^{d_\text{model} \times d_k}, \qquad W_V \in \mathbb{R}^{d_\text{model} \times d_v}
$$

$$
Q \in \mathbb{R}^{T \times d_k}, \qquad K \in \mathbb{R}^{T \times d_k}, \qquad V \in \mathbb{R}^{T \times d_v}
$$

The matrix $Q$ contains all Query vectors, $K$ contains all Key vectors, and $V$ contains all Value vectors, all generated simultaneously through matrix multiplication. This is the first place where the highly parallel nature of self-attention becomes clearly visible.

> In modern Transformer implementations, the dimensionality of Query and Key vectors ($d_k$) is often chosen to be the same so that similarity scores can be computed using dot products. The Value vectors may use a different dimensionality ($d_v$) depending on the architecture, which is why separate notation is used for each.

Recall that for every word, we computed dot products between its Query and the Key of every other word to obtain a similarity score. At the matrix level, all of these scores are produced at once by multiplying $Q$ with $K^T$:

$$
QK^T
$$

This single matrix automatically contains every pairwise similarity score we previously computed individually:

$$
S_{11},\ S_{12},\ S_{13}, \quad S_{21},\ S_{22},\ S_{23}, \quad S_{31},\ S_{32},\ S_{33}
$$

We then apply the Softmax function to convert these raw scores into normalized attention weights:

$$
\text{Softmax}(QK^T)
$$

Softmax is applied **row by row**, not to the entire matrix at once: each row of $QK^T$ holds one token's similarity scores against every other token, and after Softmax each row becomes its own probability distribution summing to 1. That is, it tells us how much attention one token pays to every other token. Each row therefore represents how a single token distributes its attention across every token in the sequence.

Before applying Softmax, however, the original Transformer paper introduces one more step. As embedding vectors grow larger in dimensionality, dot products grow larger in magnitude too, since they accumulate contributions across more dimensions. When the scores become very large, Softmax can become overly peaked, pushing nearly all the probability mass onto a single token and shrinking gradients enough to destabilize training. To counteract this, the scores are divided by $\sqrt{d_k}$ before Softmax is applied, which keeps them in a more moderate range and the resulting attention weights spread more smoothly.

Let us call the resulting matrix of normalized attention weights $A$, to keep it clearly distinct from the projection matrices $W_Q$, $W_K$, and $W_V$:

$$
A = \text{Softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)
$$

The complete, correct formulation is therefore:

$$
\text{Attention}(Q, K, V) = AV = \text{Softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

This is the scaled dot-product attention formula from the original Transformer paper, and it is precisely what is used in modern implementations. The result is a matrix containing the contextualized representations for every word in the sequence.

The following diagram illustrates the entire pipeline together. The embedding matrix branches into $Q$, $K$, and $V$ through their respective projection matrices. The $QK^T$ similarity matrix is divided by $\sqrt{d_k}$, the row-wise Softmax normalization produces the attention matrix $A$, and finally the weighted combination with $V$ yields the contextualized representations:

![Full self-attention pipeline in matrix form](/assets/self_attention5.png)

This matrix form does exactly what the word-by-word derivation did earlier; it is simply a more compact and computationally efficient way of expressing the same mechanism. Because the entire computation is expressed using matrix operations, modern hardware such as GPUs can execute it extremely efficiently in parallel, making Transformers both powerful and scalable.

### Why This Matters for Training, Not Just Inference

The parallelism we identified in Observation 1 is not just a nice property at inference time. It is precisely what makes training Transformers at scale feasible in the first place.

Recurrent architectures process a sequence one token at a time: the computation for token 5 depends on token 4, which depends on token 3, and so on. Even during training, the model has to crawl through a sequence step by step, and on corpora containing billions of tokens, this becomes a serious bottleneck.

Self-attention removes it entirely. Because $Q$, $K$, and $V$ are computed through simple matrix multiplications of $E$, and because $QK^T$ and $\text{Softmax}(QK^T / \sqrt{d_k})V$ are themselves just matrix operations, an entire batch of sequences can be pushed through the layer in one shot. Gradients for every token in every sequence can therefore be computed simultaneously rather than one token at a time, letting GPUs (built specifically for large matrix multiplications) be used to their full potential.

This is a big part of why Transformer-based models could be scaled to billions of parameters and trained on internet-scale datasets in a way that was simply not practical with recurrent architectures. Parallelism is one of the central reasons the Transformer revolution happened at all.



## Conclusion

Let us take a step back and look at where we started.

The problem began with static embeddings.

A word such as *Apple* or *bank* would always receive the same vector representation regardless of the context in which it appeared. This made it difficult for models to distinguish between different meanings of the same word.

What we needed was a mechanism capable of producing contextualized representations.

And that is exactly what self-attention gives us.

Rather than treating a word in isolation, self-attention allows every word to gather information from every other word in the sentence. The result is a new representation whose meaning is influenced not only by the word itself, but also by the context surrounding it.

We then took this idea one step further.

By introducing Query, Key, and Value vectors, along with the learnable matrices $W_Q$, $W_K$, and $W_V$, we transformed a simple contextualization mechanism into a trainable architecture capable of learning task-specific representations from data.

Finally, by expressing the entire computation in terms of matrix operations, we obtained a mechanism that is not only powerful, but also highly parallelizable and computationally efficient, a property that turned out to matter just as much during training as it does during inference.

At first glance, the self-attention equation

$$
\text{Attention}(Q, K, V) = \text{Softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

may look intimidating.

However, as we have seen throughout this blog, behind that compact equation lies a surprisingly intuitive idea:

Every word looks at every other word, decides how important they are, and then uses that information to build a better representation of itself.

That simple idea is the foundation of the Transformer architecture and, consequently, the foundation of nearly every modern large language model we use today.

Go back to the very beginning of this blog, to the word *Apple* and the 10,000 sentences pulling its meaning toward a fruit, or to *bank* meaning two entirely different things in two entirely different phrases. Both were really the same problem: a representation that is fixed cannot serve a meaning that is fluid. Static embeddings froze a word's meaning in place the moment training ended; self-attention lets that meaning move, recomputed sentence by sentence from whatever words happen to be standing nearby. That single shift, from a fixed lookup table of meanings to something read in context, the way a person actually reads it, is why self-attention became the foundation the Transformer was built on, and why nearly every large language model in use today still traces its core computation back to the same scaled dot product between a Query and a Key.

And it all started with a simple question:

What if the representation of a word could adapt itself based on the words around it?

Self-attention is the mechanism that makes that possible, and now you know, from first principles, exactly how.