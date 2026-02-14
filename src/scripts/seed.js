import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Article from '../models/article.model.js';
import Comment from '../models/comment.model.js';

const MONGO_URI = process.env.MONGO_URI;

const users = [
    {
        name: 'Arjun Mehta',
        email: 'arjun@akshar.in',
        username: 'arjunmehta',
        password: 'password123',
        bio: 'Writer, thinker, chai enthusiast. Exploring ideas at the intersection of technology and culture.',
    },
    {
        name: 'Priya Sharma',
        email: 'priya@akshar.in',
        username: 'priyasharma',
        password: 'password123',
        bio: 'Journalist turned blogger. I write about design, society, and the stories we tell ourselves.',
    },
    {
        name: 'Rohan Desai',
        email: 'rohan@akshar.in',
        username: 'rohandesai',
        password: 'password123',
        bio: 'Software engineer by day, storyteller by night. Building bridges between code and creativity.',
    },
];

const articles = [
    {
        title: 'The Art of Slow Writing in a Fast World',
        content: `In an age of tweets and threads, the long-form essay feels like a radical act. Yet it is precisely this slowness that gives writing its power.

When we sit down to write something long — something that demands patience from both writer and reader — we enter a different mode of thinking. The mind stops skimming and starts diving.

## Why Slowness Matters

The best ideas don't arrive in bursts. They simmer. They need time to marinate in the unconscious mind before they surface as coherent thoughts. This is why the greatest essayists — from Montaigne to Orwell — were not prolific in the way we understand productivity today.

They wrote slowly. They revised endlessly. They cared about every sentence.

## The Digital Paradox

We have more tools for writing than ever before. AI assists, distraction blockers, markdown editors. Yet the quality of public discourse has arguably declined. Why?

Because speed has become the metric. We optimize for output, not insight. We publish before we've thought. We react before we've understood.

## A Case for Depth

This platform — Akshar — exists as a counterpoint. A space where words are given room to breathe. Where a 2,000-word essay is not "too long" but "just beginning."

Write slowly. Think deeply. The world has enough noise. Give it signal.`,
        tags: ['writing', 'philosophy', 'culture'],
        status: 'published',
        authorIndex: 0,
    },
    {
        title: 'Design Thinking in Indian Startups: A Cultural Lens',
        content: `India's startup ecosystem is booming, but how much of it is truly designed for Indian users? Most products are clones of Western apps with superficial localization.

## The Copy-Paste Problem

When Indian startups build products, they often begin by studying Silicon Valley. This isn't inherently wrong — learning from the best is wise. But the mistake lies in copying the solutions without understanding the problems.

An Indian farmer's relationship with technology is fundamentally different from a San Francisco engineer's. The contexts, constraints, and cultures are worlds apart.

## Design as Empathy

Design thinking, at its core, is about empathy. It asks: who is the user? What do they need? What frustrates them? What delights them?

In India, this means understanding:
- **Language diversity**: 22 official languages, 121 mother tongues
- **Digital literacy gaps**: Many users are mobile-first and text-averse
- **Trust patterns**: Word-of-mouth matters more than brand marketing

## The Path Forward

Indian design needs to stop being derivative and start being generative. We need designers who understand the Kirana shop owner, the ASHA worker, the auto-rickshaw driver.

Build for India. Not for the idea of India that lives in pitch decks.`,
        tags: ['design', 'startups', 'india', 'technology'],
        status: 'published',
        authorIndex: 1,
    },
    {
        title: 'Why Every Developer Should Write',
        content: `Code is a form of writing. But I'm not talking about that. I mean actual writing — essays, blog posts, documentation, letters.

## The Connection

Programming and writing share a fundamental skill: the ability to structure thoughts clearly. When you write clean code, you're essentially telling a story to future developers. When you write an essay, you're compiling human thoughts into a readable format.

## Benefits for Developers

1. **Better Communication**: The best engineers I know are also excellent communicators. They can explain complex systems in simple terms.

2. **Clearer Thinking**: Writing forces you to confront fuzzy thinking. You can't hide behind jargon in a well-written essay.

3. **Career Growth**: Technical writing, blog posts, and documentation are force multipliers. They establish expertise and build networks.

4. **Problem Solving**: Many bugs are solved by writing about them. The act of explaining a problem often reveals its solution.

## Getting Started

You don't need a perfect setup. You don't need thousands of readers. Start with a simple blog. Write about what you learned today. Explain a concept to your past self.

The best time to start writing was five years ago. The second best time is now.`,
        tags: ['development', 'writing', 'career', 'technology'],
        status: 'published',
        authorIndex: 2,
    },
    {
        title: 'The Geometry of Indian Architecture',
        content: `From the precisely calculated vimana of a Dravidian temple to the fractal patterns of a Mughal jali, Indian architecture is fundamentally mathematical.

## Sacred Geometry

The Vastu Purusha Mandala — the geometric diagram that governs Hindu temple architecture — is one of humanity's most sophisticated spatial systems. It maps the cosmos onto a grid, with each cell assigned to a deity or element.

This isn't mere superstition. It's a design system. A way of encoding proportional relationships, structural integrity, and spiritual meaning into a single framework.

## Fractal Patterns

Long before Mandelbrot coined the term, Indian artisans were creating fractal patterns. The recursive carvings of Hoysala temples in Karnataka are a prime example — each element contains smaller versions of itself, creating a visual depth that photographs cannot capture.

## Lessons for Modern Design

Modern Indian architects are beginning to rediscover these principles. Not as nostalgic imitation, but as living design intelligence. The geometry of the past can inform the sustainability, aesthetics, and cultural resonance of future buildings.

Architecture is frozen music, they say. Indian architecture is frozen mathematics.`,
        tags: ['architecture', 'culture', 'india', 'design'],
        status: 'published',
        authorIndex: 1,
    },
    {
        title: 'Building in Public: Lessons from a Solo Developer',
        content: `Six months ago, I decided to build a project in public. Every commit, every design decision, every failure — shared openly on the internet.

## The Fear

The biggest obstacle wasn't technical. It was psychological. Showing unfinished work triggers a deep vulnerability. What if people judge my code? What if my architecture is wrong? What if I'm exposed as a fraud?

## The Reality

Nobody cared about my imperfections. What they cared about was the journey. People are drawn to authenticity, to seeing the messy creative process behind polished products.

## What I Learned

1. **Accountability works**: Knowing others are watching kept me disciplined
2. **Feedback is gold**: Strangers pointed out bugs and suggested features I never considered
3. **Community forms**: Other builders started following along, sharing their own journeys
4. **Impostor syndrome fades**: When you show your work daily, you realize everyone is figuring things out as they go

## The Takeaway

Building in public isn't about self-promotion. It's about honest creation. It's about removing the gap between the polished final product and the chaotic process that created it.

Start sharing. Start today.`,
        tags: ['development', 'opensource', 'career'],
        status: 'published',
        authorIndex: 2,
    },
    {
        title: 'The Lost Art of Letter Writing',
        content: `My grandmother kept every letter she ever received. Stacks of them, tied with red thread, stored in a tin trunk. When she died, we found forty years of correspondence — a complete social history of a family, a neighborhood, a changing nation.

## What Letters Gave Us

Letters demanded thought. You couldn't dash off a letter the way you fire off a WhatsApp message. The physical act of writing — pen on paper, ink drying, envelope sealed — imposed a natural friction that elevated the quality of communication.

## The Digital Equivalent

Email was supposed to be the digital letter. Instead, it became the digital memo. Social media was supposed to connect us. Instead, it made us perform.

Where is the digital space for slow, thoughtful, personal communication?

## A Modest Proposal

Perhaps blogging is the closest heir to letter writing. Not the SEO-optimized, keyword-stuffed kind. But the personal essay. The open letter. The thoughtful reflection shared with whoever cares to read.

Write as if you're writing to one person. Write as if your words will be tied with red thread and kept in a tin trunk. Write as if it matters.

Because it does.`,
        tags: ['writing', 'culture', 'philosophy'],
        status: 'published',
        authorIndex: 0,
    },
];

const comments = [
    { content: 'This resonates deeply. We need more spaces for slow thinking.', articleIndex: 0, authorIndex: 1 },
    { content: 'Beautifully written. The Montaigne reference is perfect.', articleIndex: 0, authorIndex: 2 },
    { content: 'As someone who designs for rural India, I couldn\'t agree more with the empathy point.', articleIndex: 1, authorIndex: 2 },
    { content: 'The kirana shop analogy is spot on. We need more India-first design.', articleIndex: 1, authorIndex: 0 },
    { content: 'Started writing because of advice like this. Changed my career trajectory.', articleIndex: 2, authorIndex: 0 },
    { content: 'Writing is debugging for the mind. Great piece.', articleIndex: 2, authorIndex: 1 },
    { content: 'The fractal architecture point blew my mind. Need to visit Hoysala temples now.', articleIndex: 3, authorIndex: 0 },
    { content: 'Building in public changed everything for me too. Great to see this perspective.', articleIndex: 4, authorIndex: 1 },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Article.deleteMany({});
        await Comment.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create users
        const createdUsers = [];
        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await User.create({
                ...userData,
                password: hashedPassword,
            });
            createdUsers.push(user);
            console.log(`👤 Created user: ${user.name} (@${user.username})`);
        }

        // Set up follow relationships
        // Arjun follows Priya and Rohan
        await User.findByIdAndUpdate(createdUsers[0]._id, {
            $addToSet: { following: [createdUsers[1]._id, createdUsers[2]._id] },
        });
        await User.findByIdAndUpdate(createdUsers[1]._id, {
            $addToSet: { followers: createdUsers[0]._id },
        });
        await User.findByIdAndUpdate(createdUsers[2]._id, {
            $addToSet: { followers: createdUsers[0]._id },
        });

        // Priya follows Arjun
        await User.findByIdAndUpdate(createdUsers[1]._id, {
            $addToSet: { following: createdUsers[0]._id },
        });
        await User.findByIdAndUpdate(createdUsers[0]._id, {
            $addToSet: { followers: createdUsers[1]._id },
        });

        console.log('🤝 Set up follow relationships');

        // Create articles
        const createdArticles = [];
        for (const articleData of articles) {
            const { authorIndex, ...data } = articleData;
            const article = await Article.create({
                ...data,
                author: createdUsers[authorIndex]._id,
            });
            createdArticles.push(article);
            console.log(`📝 Created article: "${article.title}" by @${createdUsers[authorIndex].username}`);
        }

        // Add likes
        // Priya likes Arjun's articles
        for (const article of createdArticles.filter((_, i) => articles[i].authorIndex === 0)) {
            article.likes.push(createdUsers[1]._id);
            article.likesCount = article.likes.length;
            await article.save();
        }
        // Rohan likes all articles
        for (const article of createdArticles) {
            if (!article.likes.includes(createdUsers[2]._id)) {
                article.likes.push(createdUsers[2]._id);
                article.likesCount = article.likes.length;
                await article.save();
            }
        }
        console.log('❤️  Added likes');

        // Create comments
        for (const commentData of comments) {
            const { articleIndex, authorIndex, ...data } = commentData;
            await Comment.create({
                ...data,
                blog: createdArticles[articleIndex]._id,
                author: createdUsers[authorIndex]._id,
            });
        }
        console.log(`💬 Created ${comments.length} comments`);

        console.log('\n🎉 Seed complete! Here are the login credentials:');
        console.log('─'.repeat(50));
        for (const user of users) {
            console.log(`  📧 ${user.email} / ${user.password} (@${user.username})`);
        }
        console.log('─'.repeat(50));

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

seed();
