-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadUsers" (
    "user_id" INTEGER NOT NULL,
    "thread_id" INTEGER NOT NULL,

    CONSTRAINT "ThreadUsers_pkey" PRIMARY KEY ("user_id","thread_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ThreadUsers" ADD CONSTRAINT "ThreadUsers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadUsers" ADD CONSTRAINT "ThreadUsers_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
