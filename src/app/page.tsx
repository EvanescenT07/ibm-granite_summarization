import FileUploader from "@/components/upload/fileUploader";
import HistoryList from "@/components/history/history";
import LoginButton from "@/components/ui/login-button";
import { getServerSession } from "next-auth";
import { authentication } from "./api/auth/[...nextauth]/route";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const session = await getServerSession(authentication);

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <p className="font-bold">DocuSummarize</p>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="container flex flex-col items-center py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            AI-Powered Document Summarizer
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Instantly get concise summaries of your DOCX and TXT files. Save
            time, get key insights faster.
          </p>
        </div>

        <div className="w-full max-w-2xl space-y-12">
          {session?.user ? (
            <>
              <FileUploader />
              <HistoryList />
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center font-semibold">
                  Please sign in to begin.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
