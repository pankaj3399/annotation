## ⚙️ Tech Stack

- [Next.js](https://nextjs.org/) – Framework
- [Typescript](https://www.typescriptlang.org/) – Language
- [Tailwind](https://tailwindcss.com/) – CSS
- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [Mongoose](https://mongoosejs.com/) - ORM
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) – Hosting

## 👨‍💻 Getting Started

### Prerequisites

Here's what you need to be able to run Annotator:

- Node.js 
- MongoDB Database - connection string
- UploadThing - token



## 💁‍♂️ Setting up the Project

#### First Clone the repository

```shell
git clone https://github.com/Gourav-21/annotator.git

```



#### 1. go to the folder

```shell
cd annotator
```


#### 2. Install npm dependencies

```shell
npm install
```

#### 3. Copy the environment variables to `.env.local` and change the values

```shell
cp .env.example .env.local
```

The following environment variables must be set:
- `MONGODB_URI` - The connection string for the MongoDB database
- `UPLOADTHING_TOKEN` - Token for the UploadThing service.

- `NEXTAUTH_SECRET` - Secret key for the NextAuth.js authentication.
- `NEXTAUTH_URL` - URL for the NextAuth.js authentication callback.

Replace the placeholder values with your actual credentials. You can obtain these credentials by signing up for the corresponding websites on [MongoDB](https://www.mongodb.com/) and [Uploadthing](https://uploadthing.com/). 



#### 4. Run the dev server

```shell
npm run dev
```

#### 5. Open the app in your browser

Visit [http://localhost:3000](http://localhost:3000) in your browser.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
