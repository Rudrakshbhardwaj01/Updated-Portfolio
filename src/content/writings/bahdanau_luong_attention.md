---
title: "HOW ATTENTION LEARNS WHERE TO LOOK"
date: "2026-06-17"
description: "A detailed exploration of Bahdanau and Luong Attention, including alignment scores, additive vs multiplicative attention, context vectors, attentional hidden states, and the mathematical foundations behind sequence-to-sequence attention mechanisms."
category: "Deep Learning"
---

# How Attention Learns Where to Look: A Deep Dive into Bahdanau and Luong Attention

<img
  src="/assets/attention_types_new.png"
  alt="Attention Banner"
  class="blog6"
/>

If you've landed here, chances are you've either read my previous post where we built the intuition behind attention from the ground up, or you've already spent some time exploring what attention is and why it became such a pivotal idea in deep learning. Either way, you're in the right place because now it's time to move beyond the intuition and see how attention actually works under the hood.

If not, feel free to check that blog out first before moving forward with this one. You can read it [here↗](/writings/attention-101).

The previous blog wrapped up with a curious question: how exactly are the attention weights, the $\alpha$'s, calculated?

As we briefly discussed, the attention context vector is computed as a weighted sum of the encoder hidden states, and those weights are the attention weights $\alpha_{ij}$. Naturally, this leads to the next question: where do these weights actually come from?

There are two classic approaches that answer this question:

1. Bahdanau Attention
2. Luong Attention

These two mechanisms differ primarily in how they compute the alignment scores that eventually become the attention weights.

Bahdanau Attention is also commonly referred to as **Additive Attention**, while Luong Attention is often called **Multiplicative Attention**.

In this blog, we will understand both of them from first principles and build intuition for what is actually happening under the hood.

---

## Putting a Magnifying Lens on Both Types of Attention

Bahdanau Attention, also known as Additive Attention, is actually very close to the architecture we discussed in the previous blog. In fact, both Bahdanau Attention and Luong Attention are really just different ways of implementing the function $f$ that we briefly talked about earlier.

Remember this equation?

$$
e_{ij} = f(s_{i-1}, h_j)
$$

The entire difference between Bahdanau and Luong Attention lies in how this function $f$ is defined and computed.

In the case of Bahdanau Attention, $f$ is implemented using a small feedforward neural network. Feedforward neural networks are flexible function approximators, making them a natural choice for learning alignment scores, so that's the approach we'll go with.

The structure is actually pretty simple.

Suppose we are calculating the attention weight corresponding to the $i^{th}$ decoder time step and the $j^{th}$ encoder time step. We take two inputs:

- $s_{i-1}$, the hidden state of the decoder from the previous time step.
- $h_j$, the hidden state of the encoder at position $j$.

These two vectors are fed into a small feedforward neural network.

<div style="text-align:center; margin: 2rem 0;">
  <img
    src="/assets/bahdanau.png"
    alt="Bahdanau attention alignment network using decoder and encoder hidden states"
    style="width:85%; max-width:900px;"
  />
</div>

The output of this neural network is a single scalar value:

$$
e_{ij}
$$

This is the alignment score. You can think of it as the network's estimate of how relevant the encoder hidden state $h_j$ is for generating the output at decoder step $i$.

Of course, these alignment scores by themselves are not very useful. They can take arbitrary values and cannot yet be interpreted as attention weights. So, just as we discussed in the previous blog, we pass all the alignment scores corresponding to the current decoder step through a softmax layer:

$$
\alpha_{ij} = \text{softmax}(e_{ij})
$$

This converts the raw alignment scores into attention weights.

These attention weights are then used to compute the context vector:

$$
c_i = \sum_j \alpha_{ij} h_j
$$

And this context vector $c_i$ is what gets supplied to the decoder while generating the output at time step $i$.

Intuitively, $c_i$ tells the decoder how much weight to place on each encoder hidden state while producing the current output. Encoder hidden states with larger attention weights contribute more to $c_i$, while those with smaller attention weights contribute less.

So, if we zoom out for a second, Bahdanau Attention is essentially a learnable scoring mechanism. Given a decoder state and an encoder state, it learns to assign a relevance score between them. Everything else (the softmax, the attention weights, and the context vector) follows exactly the same pipeline that we already discussed in the previous blog.

### A Note on Notation

You'll often see the Bahdanau alignment score written in the literature as:

$$
e_{ij} = v_a^T \tanh(W_s s_{i-1} + W_h h_j)
$$

This looks different from the concatenation-based version we're using, $e_{ij} = V^T \tanh(W[s_{i-1}; h_j] + b)$, but the two are mathematically equivalent up to parameterization. Concatenating $s_{i-1}$ and $h_j$ and multiplying by a single matrix $W$ is the same as multiplying each vector by its own sub-matrix ($W_s$ and $W_h$, the two halves of $W$) and summing the results, since matrix multiplication distributes over concatenation that way. The paper's version simply omits an explicit bias term for notational simplicity; the bias isn't absorbed into $W_h h_j$, it's just left out, and many practical implementations add one back in regardless. So the difference you see across papers and implementations is purely notational, not architectural.

---

## Computing the Attention Weights for $c_1$

Now, we can calculate the attention weights needed to construct \(c_1\).

To do this, we compare the previous decoder hidden state \(s_0\) with every encoder hidden state \(h_j\), producing a set of alignment scores:

$$
e_{1j} = f(s_0, h_j)
$$

Since we are calculating the context vector for the first decoder step, we need the attention weights:

$$
\alpha_{11},\ \alpha_{12},\ \alpha_{13},\ \alpha_{14}
$$

which means we first need the corresponding alignment scores:

$$
e_{11},\ e_{12},\ e_{13},\ e_{14}
$$

To compute these scores, we feed the decoder hidden state $s_0$ together with every encoder hidden state into the feedforward neural network.

Assume that both $s_{i}$ and $h_j$ are 4-dimensional vectors. (Real models almost never use vectors this small: hidden-state dimensions in the hundreds or even thousands are typical. We're sticking with 4 purely so the matrices stay easy to read on the page.) For each encoder position $j$, we form the concatenated vector $[s_0; h_j]$, which is an 8-dimensional vector. When we do this for all four encoder positions simultaneously, we stack these concatenated vectors row-wise into a matrix:

$$
\begin{bmatrix}
s_{01} & s_{02} & s_{03} & s_{04} & h_{11} & h_{12} & h_{13} & h_{14} \\
s_{01} & s_{02} & s_{03} & s_{04} & h_{21} & h_{22} & h_{23} & h_{24} \\
s_{01} & s_{02} & s_{03} & s_{04} & h_{31} & h_{32} & h_{33} & h_{34} \\
s_{01} & s_{02} & s_{03} & s_{04} & h_{41} & h_{42} & h_{43} & h_{44}
\end{bmatrix}
$$

This is a $4 \times 8$ matrix. Each row is the concatenation of $s_0$ with one encoder hidden state, an 8-dimensional vector. We stack four such rows because we have four encoder positions, and each row corresponds to a different encoder position rather than a different training example.

You can think of each row as one comparison between the decoder state and a particular encoder hidden state.

- The first row corresponds to the pair $(s_0, h_1)$ and will be used to calculate $e_{11}$.
- The second row corresponds to $(s_0, h_2)$ and will be used to calculate $e_{12}$.
- Likewise, the third and fourth rows are used to calculate $e_{13}$ and $e_{14}$ respectively.

This entire matrix is fed into the feedforward neural network in one shot. We're processing all four encoder positions simultaneously through matrix operations purely for computational efficiency: there's no batch of training examples here, just one decoder step's worth of comparisons stacked together. Since our network has a single output unit, it produces four alignment scores:

$$
\begin{bmatrix}
e_{11} \\ e_{12} \\ e_{13} \\ e_{14}
\end{bmatrix}
$$

Passing these through a softmax layer gives us the attention weights:

$$
\begin{bmatrix}
\alpha_{11} \\ \alpha_{12} \\ \alpha_{13} \\ \alpha_{14}
\end{bmatrix}
$$

which are then used to compute the context vector $c_1$.

---

## Inside the Feedforward Neural Network

Here's what actually happens inside this feedforward neural network.

Recall our assumptions:

- The input matrix has shape $4 \times 8$.
- The hidden layer contains 3 neurons.
- The output layer contains 1 neuron.

Since the input dimension is 8 and the hidden layer contains 3 units, the weight matrix $W$ connecting the input layer to the hidden layer will have dimensions:

$$
W \in \mathbb{R}^{8 \times 3}
$$

*(Depending on the notation being used, you might sometimes see this written as $3 \times 8$. The difference is purely a matter of convention. For our discussion, we'll stick with the $8 \times 3$ notation.)*

Now, remember that our input matrix is $4 \times 8$, with each of the four rows corresponding to one encoder position rather than a training example. We process all four rows together through matrix operations purely for computational efficiency; there's no need to loop over them one at a time.

During forward propagation, the first operation is a matrix multiplication:

$$
(4 \times 8) \cdot (8 \times 3) \rightarrow (4 \times 3)
$$

So after the first layer, we obtain a matrix of shape $4 \times 3$.



We add the bias terms and apply a non-linearity such as $\tanh$:

$$
H = \tanh(XW + b)
$$

Even after this operation, the output still has shape $4 \times 3$.

Next, this hidden-layer output is multiplied by the weight matrix $V$ connecting the hidden layer to the output layer.

Since the hidden layer contains 3 neurons and the output layer contains 1 neuron:

$$
V \in \mathbb{R}^{3 \times 1}
$$

Performing the multiplication gives:

$$
(4 \times 3) \cdot (3 \times 1) \rightarrow (4 \times 1)
$$

This means that the network produces four scalar outputs:

$$
\begin{bmatrix}
e_{11} \\ e_{12} \\ e_{13} \\ e_{14}
\end{bmatrix}
$$

These are our alignment scores.

Notice that these are not yet attention weights. They are simply raw scores produced by the neural network. They can be positive, negative, large, small, whatever the network decides is appropriate.

To convert them into attention weights, we pass them through a softmax layer:

$$
\alpha_{1j} = \frac{\exp(e_{1j})}{\sum_k \exp(e_{1k})}
$$

For our example, this becomes:

$$
\alpha_{11} = \frac{\exp(e_{11})}{\exp(e_{11}) + \exp(e_{12}) + \exp(e_{13}) + \exp(e_{14})}
$$

and similarly for $\alpha_{12}$, $\alpha_{13}$, and $\alpha_{14}$.

The nice thing about softmax is that:

- Every attention weight becomes positive.
- All attention weights add up to 1.

So after applying softmax, we finally obtain:

$$
\alpha_{11},\ \alpha_{12},\ \alpha_{13},\ \alpha_{14}
$$

These are the attention weights that tell us how much weight to assign each encoder hidden state while generating the first output word.

Once we have these weights, we simply plug them into:

$$
c_1 = \alpha_{11}h_1 + \alpha_{12}h_2 + \alpha_{13}h_3 + \alpha_{14}h_4
$$

which gives us the context vector $c_1$.

The attention mechanism has done its job. We now have:

- The context vector $c_1$,
- The decoder input token (the start token),
- And the decoder hidden state from the previous step.

At a high level, the decoder update can be written as:

$$
s_i = \mathrm{LSTM}(y_{i-1},\, s_{i-1},\, c_i)
$$

meaning that the previous output token, the previous decoder state, and the context vector jointly determine the next decoder state.

The decoder LSTM then produces:

- The first output word, **"लाइट"**,
- And an updated decoder hidden state $s_1$.

(As a quick reminder for anyone jumping in without the previous blog: our running example translates the English sentence "Turn off the lights," so the decoder is generating the Hindi words for that sentence one token at a time.)

In other words, not only have we generated the first output token, but we have also updated the decoder's internal state.
---

## Moving to Decoder Time Step 2

Moving forward to the second decoder time step, our goal now is to compute the context vector $c_2$.

As per the attention equation:

$$
c_2 = \alpha_{21}h_1 + \alpha_{22}h_2 + \alpha_{23}h_3 + \alpha_{24}h_4
$$

The decoder state has been updated from $s_0$ to $s_1$ since we generated the first output word, **"लाइट"**. So to get the new attention weights $\alpha_{21}$, $\alpha_{22}$, $\alpha_{23}$, and $\alpha_{24}$, we concatenate $s_1$ with each encoder hidden state:

$$
\begin{bmatrix}
s_{11} & s_{12} & s_{13} & s_{14} & h_{11} & h_{12} & h_{13} & h_{14} \\
s_{11} & s_{12} & s_{13} & s_{14} & h_{21} & h_{22} & h_{23} & h_{24} \\
s_{11} & s_{12} & s_{13} & s_{14} & h_{31} & h_{32} & h_{33} & h_{34} \\
s_{11} & s_{12} & s_{13} & s_{14} & h_{41} & h_{42} & h_{43} & h_{44}
\end{bmatrix}
$$

Running this $4 \times 8$ matrix through $W$, the bias and activation, and then $V$ gives us the alignment scores for this step:

$$
\begin{bmatrix}
e_{21} \\ e_{22} \\ e_{23} \\ e_{24}
\end{bmatrix}
$$

Softmax converts these into the new attention weights, $\alpha_{21}, \alpha_{22}, \alpha_{23}, \alpha_{24}$, which we then plug into:

$$
c_2 = \alpha_{21}h_1 + \alpha_{22}h_2 + \alpha_{23}h_3 + \alpha_{24}h_4
$$

giving us the context vector for decoder time step 2. We now have everything needed by the decoder: $c_2$, the previous decoder state $s_1$, and the previously generated output token "लाइट", which is fed back as the decoder input token $y_1$.

So by the end of decoder time step 2, we have successfully generated the second output word and updated the decoder's internal state once again, and the same cycle continues for the next decoder time step.

---

## The Process Keeps Repeating

Once decoder time step 2 is finished, we move on to decoder time step 3, then 4, then 5, and so on, until the decoder generates the end-of-sequence token.

Here's something worth pausing on: the weights inside the feedforward neural network never change from one decoder time step to another. The same network, the same $W$ and $V$, is reused at every decoder step. The weights used to calculate $e_{11}, e_{12}, e_{13}, e_{14}$ are exactly the same weights used to calculate $e_{21}, e_{22}, e_{23}, e_{24}$, and so on for every subsequent step.

So if the weights are staying fixed, why do the attention weights change?

The answer lies in the inputs. The encoder hidden states $h_1, h_2, h_3, h_4$ remain fixed throughout decoding; they were generated once and never recomputed. What keeps changing is the decoder hidden state:

$$
s_0 \rightarrow s_1 \rightarrow s_2 \rightarrow s_3 \rightarrow \cdots
$$

Because the decoder state keeps changing, the input to the feedforward neural network changes at every decoder step. And because the input changes, the alignment scores change, and because the alignment scores change, the attention weights change. That's exactly why the attention distribution can shift from one part of the source sentence to another as the decoder generates different output words.

This also clarifies why the attention weights depend on two things:

$$
\alpha_{ij} \propto f(s_{i-1}, h_j)
$$

The encoder hidden state $h_j$ tells us which part of the source sentence we're looking at, while the decoder hidden state $s_{i-1}$ tells us what has already been generated and what the decoder is currently trying to predict. Together, these two pieces of information determine how much attention a particular encoder position receives.

Since the same feedforward network is reused across all decoder time steps with shared parameters, it's often described as a **time-distributed fully connected network**: the same network applied repeatedly at every decoder step, with the same weights each time.

Of course, these parameters do eventually change, but not during the forward pass. They're only updated after the entire training example has been processed: once the decoder generates the complete output sequence, we compare it against the ground-truth sequence using a loss function such as categorical cross-entropy, and the resulting error is backpropagated through the decoder, the attention mechanism, and the alignment network, updating all the trainable parameters involved. It's worth being precise here: the attention weights $\alpha_{ij}$ themselves are not trainable parameters; they're intermediate values computed fresh on every forward pass. What actually gets updated are the weight matrices ($W$ and $V$) used to produce the alignment scores that the attention weights are derived from. When the next training example arrives, the same computations happen again, now using the updated weights.

---

## Summarizing the Mathematics

By now, the overall architecture should be fairly clear. Rather than manually repeating the calculations for every remaining decoder time step, we can pause and summarize everything mathematically.

The context vector for decoder step $i$ is computed as:

$$
c_i = \sum_j \alpha_{ij} h_j
$$

The attention weights are obtained by applying a softmax over the alignment scores:

$$
\alpha_{ij} = \frac{\exp(e_{ij})}{\sum_k \exp(e_{ik})}
$$

The only remaining question is: where do these alignment scores $e_{ij}$ come from?

We started by constructing the input matrix: taking the decoder hidden state from the previous time step, $s_{i-1}$, and concatenating it with each encoder hidden state $h_j$, producing an 8-dimensional vector $[s_{i-1}; h_j]$ for each position, then stacking these into a $4 \times 8$ matrix and feeding it into the feedforward neural network.

The first operation inside the network is a multiplication with the input-to-hidden weight matrix $W \in \mathbb{R}^{8 \times 3}$. We then add the bias term and apply $\tanh$:

*(A quick notational note: throughout the matrix walkthrough above, we treated each row as a row-vector and multiplied on the right by $W$. The equation below is written in the more compact, column-vector form you'll typically see in papers, where $W$ multiplies the concatenated vector on the left. The two are just different conventions for writing the same computation; nothing about the underlying math changes.)*

$$
z_{ij} = \tanh\!\left( W[s_{i-1}; h_j] + b \right)
$$

where $[s_{i-1}; h_j]$ denotes the concatenation of the two vectors. Next, we pass this hidden-layer representation through the output layer with weight matrix $V \in \mathbb{R}^{3 \times 1}$, giving the final alignment score:

$$
e_{ij} = V^T \tanh\!\left( W[s_{i-1}; h_j] + b \right)
$$

This single equation captures the entire Bahdanau alignment network.

Putting everything together, the complete Bahdanau Attention mechanism can be summarized as:

**Step 1: Compute the alignment scores:**

$$
e_{ij} = V^T \tanh\!\left( W[s_{i-1}; h_j] + b \right)
$$

**Step 2: Convert them into attention weights:**

$$
\alpha_{ij} = \frac{\exp(e_{ij})}{\sum_k \exp(e_{ik})}
$$

**Step 3: Compute the context vector:**

$$
c_i = \sum_j \alpha_{ij} h_j
$$

If you understand these three equations, then you understand the complete mathematical formulation of Bahdanau Attention.

---

## A Note on the Alignment Model

The feedforward neural network that we used in Bahdanau Attention has a special name. In the original research paper, it is referred to as the **alignment model**. Its entire job is to take an encoder hidden state and a decoder hidden state and produce a score that tells us how relevant those two states are to one another.

---

## A Brief Historical Detour

Before attention entered the picture, the earliest encoder-decoder models for sequence-to-sequence tasks compressed the entire input sentence into a single fixed-length vector (the encoder's final hidden state) and asked the decoder to generate the whole output from that one vector alone. This worked reasonably well for short sequences, but it created an information bottleneck: cramming an arbitrarily long sentence into one fixed-size representation meant a lot of detail simply got lost, especially as sentences grew longer.

Bahdanau Attention was introduced specifically to address that bottleneck, letting the decoder look back at all the encoder hidden states instead of relying on a single compressed summary. Luong Attention came shortly after, proposing computational simplifications and alternative scoring functions that kept the same core idea while making it cheaper to compute. Together, these two mechanisms laid much of the conceptual groundwork that later led to self-attention and the Transformer architecture.

---

## The Luong Attention Architecture

Time to discuss the architecture of Luong Attention.

At first glance, it looks very similar to Bahdanau Attention. The encoder remains exactly the same, and even most of the decoder pipeline remains unchanged.

We'll walk through it step by step using our running example.

As usual, the input sentence is fed into the encoder one token at a time:

> Turn → off → the → lights

After processing the entire sentence, the encoder produces the hidden states:

$$
h_1,\ h_2,\ h_3,\ h_4
$$

With that, the encoder's job is finished.

<div style="text-align:center; margin: 2rem 0;">
  <img
    src="/assets/luong.png"
    alt="Luong attention architecture showing dot-product attention and attentional hidden state"
    style="width:75%; max-width:900px;"
  />
</div>

Now the decoder takes over.

We begin with the initial decoder hidden state $s_0$. Depending on the implementation, this can either be initialized using the encoder's final hidden state or through some other initialization strategy.

The decoder is first given:

- The start token,
- The previous decoder state $s_0$.

At a high level, the decoder update can be written as:

$$
s_i = \mathrm{LSTM}(y_{i-1},\, s_{i-1})
$$

Using these inputs, the decoder LSTM computes the current decoder hidden state:

$$
s_1
$$

Here's an important difference from Bahdanau Attention. There, we used the previous decoder state $s_0$ to calculate the attention scores. In Luong Attention, we first compute the current decoder state $s_1$ and then use *that* state to calculate attention. This is exactly the difference we discussed earlier.

Now we take $s_1$ and compare it against every encoder hidden state using dot products:

$$
e_{11} = s_1^T h_1
$$

$$
e_{12} = s_1^T h_2
$$

$$
e_{13} = s_1^T h_3
$$

$$
e_{14} = s_1^T h_4
$$

This gives us four alignment scores:

$$
e_{11},\ e_{12},\ e_{13},\ e_{14}
$$

These scores are then passed through a softmax layer to obtain the attention weights:

$$
\alpha_{11},\ \alpha_{12},\ \alpha_{13},\ \alpha_{14}
$$

Once the attention weights are available, we compute the context vector:

$$
c_1 = \alpha_{11}h_1 + \alpha_{12}h_2 + \alpha_{13}h_3 + \alpha_{14}h_4
$$

Up to this point, everything should feel familiar. However, this is where Luong Attention introduces another difference. In Bahdanau Attention, the context vector influences the computation of the next decoder state because attention is computed before the decoder update. Luong Attention takes the opposite approach: it first computes the decoder state and only afterward combines that state with the context vector.

Specifically, we concatenate:

$$
[s_1; c_1]
$$

and pass the result through a linear layer followed by a non-linearity. This produces a new vector often called the **attentional hidden state**, which we'll denote as $\bar{s}_1$.

Putting that into an actual equation, this step looks like:

$$
\bar{s}_i = \tanh\!\left( W_c[s_i; c_i] \right)
$$

Nothing mysterious going on here, it's exactly the pipeline we just walked through, just written compactly. $s_i$ is the current decoder hidden state, $c_i$ is the context vector we computed from attention, and $[s_i; c_i]$ is the two of them concatenated together, same as before. $W_c$ is just a learnable weight matrix that gets multiplied against this concatenated vector, and the $\tanh$ is the non-linearity that squashes the result. Whatever comes out the other side is $\bar{s}_i$, the attentional hidden state: the thing that actually goes on to produce the output token, rather than $s_i$ alone.

This attentional hidden state is what is ultimately used to generate the output token. In other words:

$$
s_1 \rightarrow c_1 \rightarrow \bar{s}_1 \rightarrow \hat{y}_1
$$

rather than directly using $s_1$ alone. The decoder first forms its own opinion about what should be generated next by computing $s_1$. Then attention is applied, relevant information is gathered from the encoder through $c_1$, and finally both pieces of information are combined to form the attentional hidden state $\bar{s}_1$, which is then used to generate the first output token.

---

## Decoder Time Step 2 in Luong Attention

Once the first output word has been generated, we move on to the second decoder time step. The process is almost identical.

The decoder now takes the previous output token (**"लाइट"**) and the previous decoder state $s_1$, and computes the next decoder hidden state $s_2$.

Instead of sending $s_2$ directly to the output layer, we first use it to calculate the attention scores:

$$
e_{21} = s_2^T h_1
$$

$$
e_{22} = s_2^T h_2
$$

$$
e_{23} = s_2^T h_3
$$

$$
e_{24} = s_2^T h_4
$$

These alignment scores are passed through a softmax layer, giving $\alpha_{21}, \alpha_{22}, \alpha_{23}, \alpha_{24}$, which we use to calculate the context vector:

$$
c_2 = \alpha_{21}h_1 + \alpha_{22}h_2 + \alpha_{23}h_3 + \alpha_{24}h_4
$$

Now comes the key architectural step: instead of feeding the context vector into the decoder input, we concatenate it with the current decoder hidden state, $[s_2; c_2]$, and pass this combined representation through a small feedforward layer to produce the attentional hidden state $\bar{s}_2$. This attentional hidden state is used to generate the next output token: **"बंद"**.

At the same time, the decoder state has already been updated to $s_2$, which will be used to compute the next decoder state $s_3$. The same process then repeats for the remaining decoder steps until the entire output sequence has been generated.

---

## Why Luong Attention Computes Alignment Scores the Way It Does

Now that we understand Luong Attention, we can talk about the two key differences it introduces.

### First Difference: Using the Current Decoder State

In Bahdanau Attention we computed the alignment score using the previous decoder hidden state:

$$
e_{ij} = f(s_{i-1}, h_j)
$$

Luong Attention makes a small but meaningful change. Instead of using the previous decoder hidden state, it uses the current decoder hidden state:

$$
e_{ij} = f(s_i, h_j)
$$

The intuition is fairly straightforward: since $s_i$ contains more up-to-date information about the current decoding step, it can potentially make a better decision about which encoder positions deserve attention.

### Second Difference: Replacing the Alignment Network

The second difference is even more interesting. In Bahdanau Attention, the function $f$ was implemented using the alignment model:

$$
e_{ij} = V^T \tanh\!\left( W[s_{i-1}; h_j] + b \right)
$$

Luong Attention asks a simple question:

> Do we really need an entire neural network just to measure how related two hidden states are?

Instead of passing the vectors through an alignment network, the simplest form of Luong Attention directly computes their dot product:

$$
e_{ij} = s_i^T h_j
$$

A dot product only works if the two vectors have the same dimensionality, so $s_i$ and $h_j$ need to line up in size. In our running example that's true by construction, but in general the decoder and encoder hidden states won't always match; if they don't, a learned projection matrix can map one of them into the other's space before the dot product is taken.

Suppose:

$$
s_i = \begin{bmatrix} a \\ b \\ c \\ d \end{bmatrix}
\quad \text{and} \quad
h_j = \begin{bmatrix} e \\ f \\ g \\ h \end{bmatrix}
$$

Then:

$$
e_{ij} = ae + bf + cg + dh
$$

which is just a scalar value, and this scalar becomes the alignment score. Once we have all the alignment scores for a decoder step, we apply softmax exactly as before:

$$
\alpha_{ij} = \frac{\exp(e_{ij})}{\sum_k \exp(e_{ik})}
$$

and then compute $c_i = \sum_j \alpha_{ij} h_j$, just like in Bahdanau Attention.

### Why Does This Work?

The purpose of the alignment score isn't to perform some complicated transformation, it's simply to measure how relevant an encoder hidden state is for the current decoding step. A dot product already acts as a similarity measure: if two vectors point in similar directions, their dot product tends to be large; if they're dissimilar, it tends to be smaller. Worth noting, though: the dot product depends on both the direction and the magnitude of the two vectors, so it isn't quite the same thing as cosine similarity, which only cares about direction. Even so, it works well in practice as a similarity proxy for measuring how compatible two hidden states are.

So instead of learning a complicated scoring function through a neural network, Luong Attention uses this simpler similarity-based approach. This reduces computation and introduces fewer parameters, making the attention mechanism faster and simpler to train.

### Beyond Dot Product: Luong's Other Scoring Functions

It's worth knowing that the original Luong paper didn't propose dot-product attention alone; it introduced a family of scoring functions, with dot product being just the simplest member:

**Dot:**
$$
\text{score}(h_t, h_s) = h_t^T h_s
$$

**General:**
$$
\text{score}(h_t, h_s) = h_t^T W_a h_s
$$

**Concat:**
$$
\text{score}(h_t, h_s) = v_a^T \tanh(W_a[h_t; h_s])
$$

Dot is the version we just walked through, no learnable parameters, just a raw similarity measure between the two hidden states. General introduces a learnable weight matrix $W_a$ between the two vectors, giving the model some flexibility to learn which dimensions of the hidden states should matter more when computing similarity, while still being far cheaper than a full alignment network. Concat is the closest in spirit to Bahdanau's approach: it concatenates the two hidden states and pushes them through a $\tanh$-activated layer before producing a score, essentially borrowing Bahdanau's alignment model wholesale. In practice, "Luong Attention" is most often used as shorthand for the dot-product variant, since that's the version that captures the efficiency argument the paper is best known for.

The same paper also introduced a separate distinction worth knowing about: **global** versus **local** attention. Everything we've covered so far is global attention: at every decoder step, we compute alignment scores against *all* encoder hidden states. Local attention instead predicts a single position in the source sequence and attends only to a small window of encoder states around it. The motivation is efficiency on long sequences, since scoring every encoder position gets expensive as the input grows. We won't go into the formulas here, but it's worth knowing the dot/general/concat scoring functions and the global/local attention choice are two separate axes of the same paper.

---

## Why Both Mechanisms Exist: A Trade-off, Not a Winner

It's natural to wonder, at this point, why anyone would still reach for Bahdanau Attention once Luong's simpler version exists. The answer is that the two approaches make different bets.

Bahdanau Attention's alignment network is more expressive: a feedforward layer with a $\tanh$ non-linearity can learn more complex relationships between decoder and encoder states than a simple dot product can. That expressiveness comes at a cost, though: the alignment model introduces its own weight matrices ($W$ and $V$, or $W_s$, $W_h$, and $v_a$ depending on notation) that must be learned, and every alignment score now requires a forward pass through that network rather than a single dot product.

Luong Attention trades some of that expressiveness for simplicity. The dot-product variant needs no additional parameters at all, and computing alignment scores is just a matrix multiplication between the decoder state and the encoder states: cheap, fast, and easy to parallelize. The general and concat variants reintroduce some learnable structure, but even general's single weight matrix $W_a$ is lighter than Bahdanau's full alignment network.

Neither approach is universally better. It comes down to how much capacity your model can afford, how large your dataset is, and how much you're actually gaining from the extra expressiveness on your particular task; gains that, in practice, turned out modest enough that the simpler, cheaper Luong-style mechanisms became the more common default in later work.

---

## Bahdanau vs. Luong: A Side-by-Side Comparison

| | Bahdanau Attention | Luong Attention |
|---|---|---|
| **Decoder state used** | Previous state, $s_{i-1}$ | Current state, $s_i$ |
| **Alignment function** | Feedforward network with $\tanh$: $V^T\tanh(W[s_{i-1};h_j]+b)$ | Dot, general, or concat (most commonly dot: $s_i^Th_j$) |
| **Additional parameters** | $W$, $V$ (or $W_s$, $W_h$, $v_a$) | None for dot; $W_a$ for general; $v_a$, $W_a$ for concat |
| **Computational cost** | Higher (full forward pass per alignment score) | Lower (dot product is a single matrix multiply) |
| **Where context is incorporated** | Before computing the decoder state, as an input to it | After computing the decoder state, combined to form $\bar{s}_i$ |
| **Common names** | Additive Attention | Multiplicative Attention |

> **Key Takeaways**
> 1. Both Bahdanau and Luong compute attention weights from alignment scores.
> 2. Bahdanau uses a learnable alignment network and the previous decoder state.
> 3. Luong typically uses multiplicative scoring and the current decoder state.
> 4. Both ultimately produce a context vector that helps generate the next output token.

---

## Wrapping Up

And that's Bahdanau Attention and Luong Attention.

At first glance, the differences between the two might seem small. After all, both mechanisms are trying to solve the exact same problem: determining which encoder hidden states are most relevant while generating a particular output token. However, the way they approach that problem is quite different.

Bahdanau Attention uses a learnable alignment model and relies on the previous decoder state to calculate attention scores. Luong Attention simplifies the scoring mechanism, often replacing it with a dot product, and uses the current decoder state instead.

The reason we spent so much time understanding these architectures is that they provide the conceptual bridge to what comes next. When you eventually study self-attention and transformers, many of the ideas will start feeling familiar. The notion of calculating relevance scores, converting them into attention weights, and using those weights to build context-aware representations all originate from the ideas we've discussed in this blog.

Self-attention is at the heart of the Transformer architecture, and having a strong intuition for Bahdanau and Luong Attention makes that journey significantly easier. So if you've understood how the alignment scores are computed, how attention weights emerge from them, and how the context vector influences the decoder, you're in a great position to move forward.

In the next blog, we'll build on these ideas and start exploring attention mechanisms that no longer rely on recurrent networks at all.
