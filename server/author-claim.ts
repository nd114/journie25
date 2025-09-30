
import "dotenv/config";
import { db } from "./db";
import { papers, users } from "../shared/schema";
import { eq, like, and, or } from "drizzle-orm";

export interface AuthorClaimRequest {
  userId: number;
  paperIds: number[];
  authorName: string;
  orcid?: string;
  evidence?: string;
}

export interface AuthorClaimResponse {
  success: boolean;
  claimedPapers: number;
  message: string;
}

export async function claimAuthorshipByName(
  userId: number,
  authorName: string,
  orcid?: string
): Promise<AuthorClaimResponse> {
  try {
    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, claimedPapers: 0, message: "User not found" };
    }

    // Find papers where the author name appears in the authors array
    const matchingPapers = await db.query.papers.findMany({
      where: and(
        eq(papers.isPublished, true),
        // Check if authorName is in the authors JSON array (case-insensitive)
      ),
    });

    let claimedCount = 0;

    for (const paper of matchingPapers) {
      const authors = Array.isArray(paper.authors) ? paper.authors : [];
      const authorIds = Array.isArray(paper.authorIds) ? paper.authorIds : [];

      // Check if author name matches (case-insensitive)
      const nameMatch = authors.some((author: string) => 
        author.toLowerCase().includes(authorName.toLowerCase()) ||
        authorName.toLowerCase().includes(author.toLowerCase())
      );

      if (nameMatch && !authorIds.includes(userId)) {
        // Add user to authorIds
        const updatedAuthorIds = [...authorIds, userId];
        
        await db
          .update(papers)
          .set({ authorIds: updatedAuthorIds })
          .where(eq(papers.id, paper.id));

        claimedCount++;
      }
    }

    // Update user ORCID if provided
    if (orcid && !user.orcid) {
      await db
        .update(users)
        .set({ orcid })
        .where(eq(users.id, userId));
    }

    return {
      success: true,
      claimedPapers: claimedCount,
      message: `Successfully claimed authorship of ${claimedCount} papers`
    };

  } catch (error) {
    console.error("Error claiming authorship:", error);
    return { 
      success: false, 
      claimedPapers: 0, 
      message: "Failed to claim authorship" 
    };
  }
}

export async function getPotentialClaims(userId: number, userName: string): Promise<any[]> {
  try {
    // Find papers that might belong to this user based on name similarity
    const allPapers = await db.query.papers.findMany({
      where: eq(papers.isPublished, true),
      columns: {
        id: true,
        title: true,
        authors: true,
        authorIds: true,
        publishedAt: true,
      },
    });

    const potentialClaims = allPapers.filter(paper => {
      const authors = Array.isArray(paper.authors) ? paper.authors : [];
      const authorIds = Array.isArray(paper.authorIds) ? paper.authorIds : [];

      // Skip if user is already an author
      if (authorIds.includes(userId)) return false;

      // Check for name similarity
      return authors.some((author: string) => {
        const similarity = calculateNameSimilarity(userName, author);
        return similarity > 0.7; // 70% similarity threshold
      });
    });

    return potentialClaims;

  } catch (error) {
    console.error("Error finding potential claims:", error);
    return [];
  }
}

function calculateNameSimilarity(name1: string, name2: string): number {
  // Simple similarity calculation based on common words
  const words1 = name1.toLowerCase().split(/\s+/);
  const words2 = name2.toLowerCase().split(/\s+/);
  
  let matches = 0;
  const totalWords = Math.max(words1.length, words2.length);

  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || 
          word1.includes(word2) || 
          word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }

  return matches / totalWords;
}
