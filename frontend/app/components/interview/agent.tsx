"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

interface AgentProps {
    userName: string;
    userId: string;
    interviewId: string;
    feedbackId?: string;
    type: string;
    questions?: string[];
}

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const Agent = ({
    userName,
    userId,
    interviewId,
    feedbackId,
    type,
    questions,
}: AgentProps) => {

    const router = useRouter();

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState("");

    // ----- Vapi event listeners -----
    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (msg: any) => {
            if (msg.type === "transcript" && msg.transcriptType === "final") {
                setMessages((prev) => [...prev, { role: msg.role, content: msg.transcript }]);
            }
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", () => setIsSpeaking(true));
        vapi.on("speech-end", () => setIsSpeaking(false));
        vapi.on("error", (err: Error) => console.error("Vapi error:", err));

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", () => setIsSpeaking(true));
            vapi.off("speech-end", () => setIsSpeaking(false));
            vapi.off("error", (err: Error) => console.error(err));
        };
    }, []);

    // ----- Update last transcript line & handle feedback -----
    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }

        const handleGenerateFeedback = async (msgs: SavedMessage[]) => {
            const { success, feedbackId: newId } = await createFeedback({
                interviewId,
                userId,
                transcript: msgs,
                feedbackId,
            });

            if (success && newId) router.push(`/interview/${interviewId}/feedback`);
            else router.push("/");
        };

        if (callStatus === CallStatus.FINISHED) {
            if (type === "generate") router.push("/");
            else handleGenerateFeedback(messages);
        }
    }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

    // ----- COST-OPTIMIZED handleCall -----
    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        // prevent unnecessary cost
        if (type !== "generate" && (!questions || questions.length === 0)) return;

        if (type === "generate") {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName, // minimal token usage
                },
            });
            return;
        }

        const formatted = JSON.stringify(questions);

        await vapi.start(interviewer, {
            variableValues: { questions: formatted },
        });
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt="AI" width={65} height={54} className="object-cover" />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="You"
                            width={539}
                            height={539}
                            className="rounded-full size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={lastMessage}
                            className={cn(
                                "transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}
                        >
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call" onClick={handleCall}>
                        <span
                            className={cn(
                                "absolute animate-ping rounded-full opacity-75",
                                callStatus !== CallStatus.CONNECTING && "hidden"
                            )}
                        />
                        <span className="relative">
                            {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                                ? "Call"
                                : "..."}
                        </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;
