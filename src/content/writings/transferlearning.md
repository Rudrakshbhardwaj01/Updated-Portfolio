---
title: "CNN Transfer Learning: Feature Extraction and Fine-Tuning Explained"
date: "2026-06-04"
description: "How pre-trained CNNs, feature extraction, and fine-tuning let you adapt deep models without training from scratch."
category: "Deep Learning"
---
# CNN Transfer Learning: Feature Extraction and Fine-Tuning Explained

<img
  src="/assets/poster1.png"
  alt="CNN Transfer Learning Banner"
  class="poster1"
/>

You have probably heard people talk about pre-trained models, fine-tuning, or adapting existing neural networks for a specific task. Instead of training a deep neural network from scratch, we can take advantage of models that have already learned useful features from massive datasets.

This idea is known as **transfer learning**.

---

## What is Transfer Learning?

Transfer learning is the process of taking a model that has already been trained on one task and adapting it to solve a new, different task.

In this article, we will focus specifically on **CNN-based transfer learning**.

---

## Why Not Just Train From Scratch?

Fair question. Why bother with all of this? Why not just train a CNN on your own dataset and be done with it?

Because training a deep CNN from scratch often requires massive datasets, significant compute resources, and very long training times. We are talking millions of labeled images and days of GPU time. Most projects simply do not have that. Most real-world tasks have a few thousand images at best, not a few million.

Transfer learning solves this problem. Instead of starting from zero, you start from a model that already knows a lot about the visual world. You just teach it the last mile.

---

## How a CNN is Structured

Before we get into transfer learning, you need to understand how a typical Convolutional Neural Network is put together. A CNN has two major parts:

1. **Convolutional Base** - responsible for extracting features from images.
2. **Classifier Head (fully connected layers)** - responsible for making the final prediction.

```
Input Image
     |
Convolutional Base
(learns edges, textures, shapes, complex patterns)
     |
Classifier Head
(fully connected layers that use extracted features to make a prediction)
     |
Output (predicted class)
```

The convolutional layers do the heavy lifting of actually *understanding* the image. They learn patterns like edges, textures, shapes, and increasingly complex visual features as you go deeper. The fully connected layers at the end then take those extracted features and use them to classify the image.

Now, here is the key insight that makes transfer learning possible.

Most pre-trained CNNs are trained on **ImageNet**, a dataset containing over a million images across 1000 categories. Things like cats, cars, planes, furniture, animals, you name it. Because the model has already seen such a large variety of visual concepts, it learns highly reusable features.

And at their core, images are made of edges, textures, shapes, and patterns. Whether you are looking at dogs, cars, birds, or everyday objects, the low-level visual patterns are largely the same. So a model trained on ImageNet has already learned a lot of things that are useful for your completely different task too.

---

## So What Do We Actually Do in Transfer Learning?

In transfer learning, we take a pre-trained CNN model, remove its original classifier head, and attach a new classifier head designed for our own dataset.

Now you might be wondering, why do we need to remove the original head? Why can't we just keep it?

Because the original classifier head was trained to predict ImageNet's 1000 classes. Things like "tabby cat", "garbage truck", "basketball". If your task is classifying dog breeds or detecting plant diseases, those output classes simply do not match your problem. The head has to go. The convolutional base, on the other hand, is still perfectly useful.

```
Pre-trained CNN
(e.g. trained on ImageNet)

         |

Remove the original Classifier Head

         |

Keep the Convolutional Base as-is

         |

Attach a new Classifier Head
(designed for your task)

         |

Your custom model, ready to train
```

The convolutional base has already learned useful visual features from a large dataset. There is no need to relearn all of that from scratch. We just plug in a new head and point it at our own problem.

By reusing these learned features, we can train models much faster and with significantly less data.

---

## Types of Transfer Learning

There are two common approaches. Let's go through both.

---

### 1. Feature Extraction

Feature extraction is the simplest form of transfer learning. Here is what we do:

- Keep the pre-trained convolutional base.
- **Freeze all of its weights.** The convolutional layers will not update at all during training.
- Replace the original classifier head with a new one for our task.
- Train only the new classifier head on our dataset.

```
Pre-trained Convolutional Base
[FROZEN - weights do not change]
     |
     |   (acts purely as a feature extractor)
     |
New Classifier Head
[TRAINABLE - learns from your data]
     |
Output
```

Since the convolutional layers are frozen, they act purely as feature extractors. Only the fully connected layers at the end are actually learning from your new data.

This approach is computationally inexpensive because most of the network is not changing. You are only training a small portion of the total parameters.

**When does this work well?**

Feature extraction works particularly well when your new task is reasonably related to the task the original model was trained on. For example, if an ImageNet model is being adapted to classify different animal species, feature extraction often works very well. If it is being adapted to analyze satellite imagery or something that looks very different from everyday photos, fine-tuning is usually more beneficial.

For example, imagine a CNN originally trained on ImageNet. Now you want to build a model that classifies different dog breeds. Most of the visual features the original network already knows, edges, fur textures, eyes, ears, are still directly useful. So you can often get good performance by training only the classifier head.

The trade-off is that the model may not fully adapt to your specific task, which can sometimes limit how accurate it gets.

Here is what this looks like in code using TensorFlow:

```python
base_model = tf.keras.applications.ResNet50(
    weights="imagenet",
    include_top=False
)

base_model.trainable = False
```

`weights="imagenet"` loads the pre-trained weights from ImageNet training. `include_top=False` removes the original classifier head so you can attach your own. And `base_model.trainable = False` freezes the entire convolutional base, which is exactly what feature extraction means. The base just sits there and extracts features. Only your new classifier head trains.

---

### 2. Fine-Tuning

Fine-tuning goes one step further.

Instead of freezing the entire convolutional base, we freeze some of the earlier layers and let some of the later layers continue learning.

For illustration, suppose the convolutional base has five layers:

```
Convolutional Base

Layer 1  [FROZEN]
Layer 2  [FROZEN]
Layer 3  [FROZEN]
Layer 4  [TRAINABLE]
Layer 5  [TRAINABLE]

     |

New Classifier Head  [TRAINABLE]
     |
Output
```

Why does this make sense?

Early CNN layers learn very general features. Things like edges, simple gradients, basic shapes. These are useful for almost every vision task, so there is not much point in changing them.

Later CNN layers learn more task-specific features. Things like combinations of shapes that look like a dog's face, or patterns specific to a certain type of image. These are the layers that might need to adjust when you move to a new task.

By allowing the later layers to update their weights, the model can adapt its learned representations to better fit your new dataset.

Fine-tuning is more computationally expensive than feature extraction because more parameters are being updated during training. Fine-tuning also generally benefits from having more training data than feature extraction, again because more parameters need enough examples to update meaningfully. But it often produces better results, especially when your new task differs significantly from the original task, or when you have a decent amount of training data available.

**One important warning:** when fine-tuning, always use a much smaller learning rate than you would when training from scratch. If the learning rate is too high, you risk overwriting the useful features the model spent so long learning during pre-training. A typical rule of thumb is to use a learning rate that is at least 10x smaller than what you would normally use.

---

## The Typical Workflow in Practice

Most practitioners do not jump straight into fine-tuning. The common approach is to do it in two stages:

```
Step 1:
Freeze the entire convolutional base
Train only the new classifier head
(feature extraction)

          |

Step 2:
Evaluate performance

          |

Step 3:
Unfreeze some of the top convolutional layers

          |

Step 4:
Continue training with a much smaller learning rate
(fine-tuning)
```

Why do it this way? Because if you start fine-tuning immediately with randomly initialized classifier head weights, the large error gradients from the untrained head can damage the weights in the convolutional base. You first let the classifier head stabilize, then carefully unfreeze the later layers and fine-tune everything together at a low learning rate.

---

## Feature Extraction vs Fine-Tuning at a Glance

```
                  Feature Extraction        Fine-Tuning
                  
Convolutional     Fully frozen              Partially frozen
Base              

What trains       Only the new              New classifier head
                  classifier head           + some later conv layers

Compute cost      Low                       Higher

Best when         New task is similar       New task differs more
                  to original task          from the original task,
                                            or you have more data
```

---

## Popular Pre-Trained Models

So which models do people actually use for transfer learning? Here are the ones you will see most often:

- **VGG16 / VGG19** - older architectures but very straightforward. Great when you are learning because the structure is easy to understand and experiment with.
- **ResNet50** - probably the most commonly used model for transfer learning. Introduced residual connections which made it possible to train much deeper networks without the gradients vanishing. Very reliable.
- **EfficientNet** - designed to get the best accuracy per parameter. You get strong performance without a bloated model size.
- **MobileNet** - built specifically for mobile and edge devices where memory and compute are limited. Surprisingly capable given how lightweight it is.

All of these are trained on ImageNet and are available directly in TensorFlow and PyTorch with just a couple of lines of code. When you are starting a new computer vision project, one of these is almost always your first stop.

---

## A Real-World Example: Cat vs Dog Classifier

Let's make this concrete. Say you want to build a cat vs dog image classifier. Here is what the full transfer learning setup looks like:

```
Pretrained ResNet50
(trained on ImageNet)

          |

Remove original classifier head
(was predicting 1000 ImageNet classes)

          |

Add new classifier head:
Dense(128, activation='relu')
Dense(2, activation='softmax')
(now predicts just 2 classes: cat or dog)

          |

Freeze the convolutional base

          |

Train on your cat/dog images
(only the new head updates)

          |

Evaluate. If performance is good, you are done.
If you want more, unfreeze the top conv layers
and fine-tune with a small learning rate.
```

That is the full story from start to finish. A model that spent weeks learning the visual world on ImageNet, now repurposed in a fraction of the time to solve your specific problem.

---

## Conclusion

Transfer learning lets us reuse the knowledge learned by powerful pre-trained models instead of training neural networks from scratch.

In CNN-based transfer learning, we reuse the convolutional base and adapt the classifier head to our own task. Depending on the problem, we can either freeze the entire convolutional base and use it as a feature extractor, or fine-tune some of its later layers to squeeze out better performance.

This approach reduces training time, requires less data, and often produces excellent results. That is why it is one of the most widely used techniques in modern computer vision.
