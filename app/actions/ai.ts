'use server'

import { AIJob } from '@/models/aiModel';
import Task from '@/models/Task';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { task } from '../preview/page';

function updateSelectedCheckbox(item: any, responseText: string) {
  if (!item.content.selectedCheckbox) {
    item.content.selectedCheckbox = [];
  }

  const normalizedResponseText = responseText.toLowerCase();

  const validOptions = item.content.checkboxes.filter(option =>
    normalizedResponseText.includes(option.toLowerCase())
  );

  console.log('validOptions:', validOptions);

  validOptions.forEach(option => {
    if (!item.content.selectedCheckbox.includes(option)) {
      item.content.selectedCheckbox.push(option);
    }
  });
  console.log('selectedCheckbox:', item.content.selectedCheckbox);
}

function updateInputTextContent(contentArray: any[], responseText: string) {
  return contentArray.map(item => {
    if (item.type === 'inputText') {
      item.content.innerText = responseText;
    }

    if (item.type === 'checkbox') {
      updateSelectedCheckbox(item, responseText);
    }

    if (item.content && Array.isArray(item.content)) {
      item.content = updateInputTextContent(item.content, responseText);
    }

    return item;
  });
}


async function saveToDatabase(content: string, response: string, taskId: string) {
  const newContent = updateInputTextContent(JSON.parse(content), response);
  await Task.updateOne({ _id: taskId }, { content: JSON.stringify(newContent), submitted: true });
  await AIJob.updateOne({ taskid: taskId }, { completed: true });
  console.log('Saving to database:', { content, response })
}

export async function generateAndSaveAIResponse(content: string, taskId: string, apiKey: string, provider: string, model: string, systemPrompt: string) {
  if (!taskId || !content) {
    return { error: 'Missing required fields' }
  }

  const openai = createOpenAI({
    apiKey: apiKey,
    compatibility: 'strict',
  });

  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  const anthropic = createAnthropic({
    apiKey: apiKey,
  });

  try {
    const { text } = await generateText({
      model: provider === 'OpenAI' ? openai(`${model}`)
        : provider === 'Gemini' ? google(`${model}`)
          : provider === 'Anthropic' ? anthropic(`${model}`)
            : undefined,
      prompt: `
        ${systemPrompt}
        `,
    });

    const response = text

    await saveToDatabase(content, response, taskId)

    return { response, message: 'Response generated and saved successfully' }
  } catch (error) {
    console.error('Error generating or saving AI response:', error)
    return { error: 'An error occurred while generating or saving the AI response' }
  }
}

export async function aiSolve(id: string) {
  const Jobs = await AIJob.find({ projectid: id }).populate('taskid modelid');

  // const ex= [
  //   {
  //     _id: new ObjectId('67295ac2981e15c9b9b5a115'),
  //     user: new ObjectId('6718c7e9dea7086c2fccf77f'),
  //     projectid: new ObjectId('671983514cbade6da35c5e87d'),
  //     taskid: {
  //       _id: new ObjectId('6720530c67e5c428b9e2d6f5'),
  //       name: 'test - cat - 1.1',
  //       content: '[{"content":[{"content":{"innerText":"tell about cats"},"id":"2fdff12f-1159-408a-9c01-9f1bbee4f610","name":"Text","styles":{"color":"black","backgroundPosition":"center","objectFit":"cover","backgroundRepeat":"no-repeat","textAlign":"left","opacity":"100%"},"type":"text"},{"content":{"innerText":"Cats are amazing creatures. Here are some interesting facts about them:\\n\\n1. **Origin**: Cats are native to the Middle East and were first domesticated around 10,000 years ago. They were initially kept as pets by the ancient Egyptians and were highly valued for their hunting skills.\\n\\n2. **Physical Characteristics**: Cats have a unique body shape, with a flexible spine, retractable claws, and a short, smooth coat that comes in a wide range of colors and patterns. They have large ears, piercing eyes, and a slender tail.\\n\\n3. **Behavior**: Cats are known for their independence and aloofness, but they are also highly affectionate and playful. They are natural hunters and have a strong prey drive, which is why they are often found in homes with small pets like mice or birds.\\n\\n4. **Grooming**: Cats are meticulous about their grooming and spend a significant amount of time each day cleaning themselves. They use their tongues to remove dirt and debris from their coats, and they also use their claws to keep their nails trimmed.\\n\\n5. **Communication**: Cats communicate with each other through a variety of vocalizations, including meows, purrs, and hisses. They also use body language, such as ear positions and tail twitches, to convey their emotions and intentions.\\n\\n6. **Health**: Cats are generally a healthy species, but they can be prone to certain health issues like urinary tract problems, dental disease, and obesity. Regular veterinary check-ups and a balanced diet can help prevent or manage these conditions.\\n\\n7. **Lifespan**: The average lifespan of a domestic cat is around 12-15 years, although some cats have been known to live up to 20 years or more with proper care and attention.\\n\\n8. **Domestication**: Cats were first domesticated in the Middle East, where they were kept as pets and used for hunting and pest control. Over time, they were bred for their unique characteristics and became the beloved pets we know today.\\n\\n9. **Intelligence**: Cats are highly intelligent animals and are known for their problem-solving skills and memory. They are able to learn and adapt quickly, which makes them a popular choice as pets.\\n\\n10. **Playfulness**: Cats are naturally playful animals and enjoy activities like chasing toys, climbing, and pouncing on small objects. They also enjoy interactive play with their owners, such as laser pointers and feather toys.\\n\\nI hope you found these facts interesting! Do you have any other questions about cats?","limit":10000,"wordLimit":1000},"id":"ea0e3a4e-13e3-4b86-90e6-e1e028151935","name":"input Text","styles":{"backgroundPosition":"center","objectFit":"cover","backgroundRepeat":"no-repeat","textAlign":"left","opacity":"100%","width":"100%"},"type":"inputText"}],"id":"__body","name":"Body","styles":{"backgroundColor":"white"},"type":"__body"}]',
  //       project: new ObjectId('671983514cbde6da35c5e87d'),
  //       project_Manager: new ObjectId('6718c7e9dea7086c2fccf77f'),
  //       ai: new ObjectId('672762dab4d0b490bddfdfda'),
  //       status: 'rejected',
  //       submitted: true,
  //       timeTaken: 0,
  //       feedback: 'no\n',
  //       timer: 0,
  //       created_at: 2024-10-29T03:14:20.932Z,
  //       __v: 0,
  //       annotator: null
  //     },
  //     modelid: {
  //       _id: new ObjectId('672762dab4d0b490bddfdfda'),
  //       user: new ObjectId('6718c7e9dea7086c2fccf77f'),
  //       projectid: new ObjectId('671983514cbde6da35c5e87d'),
  //       model: 'GPT-3.5-turbo',
  //       provider: 'OpenAI',
  //       enabled: true,
  //       apiKey: 'askk',
  //       systemPrompt: 'solve this question {checkbox}',
  //       created_at: 2024-11-03T11:47:38.217Z,
  //       __v: 0
  //     },
  //     completed: false,
  //     __v: 0
  //   }
  // ]

  const JobPromises = Jobs.map(async (job) => {
    if (!job.taskid.annotator) {
      // const content = extractPlaceholdersFromResponse(job.taskid);
      try {
        const element = await extractElementDetails(JSON.parse(job.taskid.content));
        const systemPrompt = replacePlaceholders(job.modelid.systemPrompt, element);
        const response = await generateAndSaveAIResponse(job.taskid.content, job.taskid._id, job.modelid.apiKey, job.modelid.provider, job.modelid.model, systemPrompt);
        if (response.error) {
          throw new Error(`Error: ${response.error}`);
        }
      } catch (error) {
        await AIJob.deleteMany({ _id: job._id });
      }
    }
  });
  await Promise.all(JobPromises);
  await AIJob.deleteMany({ projectid: id });
}

function replacePlaceholders(systemPrompt: string, elements: any[]) {
  elements.forEach(element => {
    const placeholder = `{${element.name}}`;
    if (systemPrompt.includes(placeholder)) {
      let replacementContent;
      if (element.type === 'checkbox' && typeof element.content === 'object') {
        const { checkboxTitle, checkboxes } = element.content;
        replacementContent = `${checkboxTitle}: ${checkboxes.join(', ')}`;
      } else {
        replacementContent = element.content;
      }
      systemPrompt = systemPrompt.replace(placeholder, replacementContent);
    }
  });
  return systemPrompt;
}

function extractPlaceholdersFromResponse(task: task) {
  const content = JSON.parse(task.content)
  const extractedPlaceholders: string[] = []
  let hasInputText = false;
  const extractPlaceholders = (item: any) => {
    if (Array.isArray(item.content)) {
      item.content.forEach(extractPlaceholders)
    } else if (item.type) {
      if (item.type === "inputText") {
        hasInputText = true;
      }
      if ((item.type === "dynamicText" || item.type === "text") && item.content?.innerText) {
        extractedPlaceholders.push(item.content.innerText);
      }
    }
  }

  try {
    content.forEach(extractPlaceholders)
    if (!hasInputText) {
      throw new Error("Error: Missing 'inputText' type.");
    }
    if (extractedPlaceholders.length === 0) {
      throw new Error("Error: Missing 'dynamicText' or 'text' types.");
    }
    return extractedPlaceholders.join("\n")
  } catch (error: any) {
    console.error(error.message);
  }
}

async function extractElementDetails(content: any[]) {
  const elements: any[] = [];

  function extractContent(node: any) {
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(extractContent);
    } else if (node.name && node.content) {
      let extractedContent;

      switch (node.type) {
        case 'inputText':
        case 'text':
        case 'dynamicText':
          extractedContent = node.content.innerText || '';
          break;
        case 'dynamicVideo':
        case 'dynamicImage':
        case 'dynamicAudio':
        case 'recordAudio':
        case 'recordVideo':
        case 'inputRecordAudio':
        case 'inputRecordVideo':
          extractedContent = node.content.src || '';
          break;
        case 'checkbox':
          extractedContent = {
            checkboxTitle: node.content.title || '',
            checkboxes: node.content.checkboxes || [],
          };
          break;
        default:
          extractedContent = 'Unknown content';
      }

      if (typeof extractedContent === 'object' && !Array.isArray(extractedContent)) {
        elements.push({ name: `${node.name}`, type: node.type, content: extractedContent });
      } else {
        elements.push({ name: node.name, type: node.type, content: extractedContent });
      }
    }
  }

  extractContent(content[0]);

  return elements;
}

