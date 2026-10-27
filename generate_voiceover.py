import asyncio
import os
import edge_tts

# Voice selection: en-IN-PrabhatNeural is a natural, clear, professional Indian English male voice.
VOICE = "en-IN-PrabhatNeural"
RATE = "+0%"
PITCH = "+0Hz"

SLIDES = [
    {
        "slide": 1,
        "title": "Title & Introduction",
        "filename": "slide_01_intro.mp3",
        "script": (
            "Hello everyone and welcome. Today, I am excited to present SkillChain — "
            "a Blockchain-Based Skill Passport for decentralized academic and skill credential verification. "
            "Built on Ethereum using Solidity, Ethers.js, and React, SkillChain addresses credential forgery "
            "by creating a zero-trust, mathematically verifiable record for diplomas, certificates, and achievements."
        ),
    },
    {
        "slide": 2,
        "title": "Background & Motivation",
        "filename": "slide_02_background.mp3",
        "script": (
            "In our modern workforce, academic and skill credentials form the foundation for hiring and higher education. "
            "However, traditional paper certificates and standard digital PDFs are exceptionally easy to forge. "
            "Studies show that over thirty percent of resumes contain fabricated or exaggerated qualifications. "
            "With traditional background checks taking up to twenty business days and costing organizations thousands of dollars, "
            "there is an urgent need for an automated, tamper-proof solution."
        ),
    },
    {
        "slide": 3,
        "title": "Problem Statement",
        "filename": "slide_03_problem_statement.mp3",
        "script": (
            "Current verification systems suffer from four critical deficiencies. "
            "First, digital PDFs can be easily altered with consumer graphic tools, leaving no audit trail. "
            "Second, manual verification requests create long turnaround times during critical hiring cycles. "
            "Third, centralized university databases are prime targets for ransomware attacks, insider tampering, and server outages. "
            "Finally, when an institution cancels an issued certificate due to academic misconduct, downloaded copies remain in circulation "
            "with no real-time way for third parties to detect the revocation."
        ),
    },
    {
        "slide": 4,
        "title": "Proposed Solution: SkillChain",
        "filename": "slide_04_solution.mp3",
        "script": (
            "SkillChain introduces a decentralized skill passport built on the philosophy: 'Your Skills. Your Proof.' "
            "Instead of storing bulky student documents on-chain, SkillChain computes a deterministic SHA-256 cryptographic digest "
            "of the certificate details and registers that fingerprint into an immutable Ethereum smart contract. "
            "This guarantees absolute data integrity while keeping sensitive student information private."
        ),
    },
    {
        "slide": 5,
        "title": "System Architecture & Workflow",
        "filename": "slide_05_architecture.mp3",
        "script": (
            "The workflow operates seamlessly in four stages. "
            "First, the certifying authority enters the student's name, skill title, organization, and issue date into the React interface. "
            "Second, the client normalizes the payload, generates a unique certificate ID, and calculates the SHA-256 hash. "
            "Third, the transaction is signed and broadcast to our Solidity smart contract on the Ethereum network. "
            "Finally, any verifier can supply the certificate details and verify authenticity against the blockchain in milliseconds."
        ),
    },
    {
        "slide": 6,
        "title": "Smart Contract Design",
        "filename": "slide_06_smart_contract.mp3",
        "script": (
            "At the core of the blockchain layer is SkillChain.sol. "
            "The contract uses a structured Certificate data model containing the unique ID, the SHA-256 hash string, "
            "the issuer's wallet address, the block timestamp, and active status flags. "
            "Key functions include registerCertificate, which prevents duplicate IDs; verifyCertificate, which performs an on-chain "
            "keccak256 hash comparison; and revokeCertificate, which enforces strict access control so only the original issuer "
            "can invalidate their credential."
        ),
    },
    {
        "slide": 7,
        "title": "Key Project Modules",
        "filename": "slide_07_modules.mp3",
        "script": (
            "The application is organized into four intuitive modules. "
            "The Landing Page introduces the platform's vision with one-click navigation. "
            "The Add Certificate module validates inputs, calculates cryptographic hashes, and handles blockchain submission. "
            "The My Certificates dashboard displays credentials stored in local browser memory with live status querying. "
            "Finally, the Public Verification portal allows any recruiter or institution to independently verify credentials."
        ),
    },
    {
        "slide": 8,
        "title": "Security & Cryptographic Mechanisms",
        "filename": "slide_08_security.mp3",
        "script": (
            "Security is built on three pillars. "
            "First, SHA-256 data privacy: by storing only the cryptographic fingerprint on-chain, private student information is never "
            "exposed to the public ledger. "
            "Second, blockchain immutability: once confirmed in a block, certificate records cannot be edited, overwritten, or backdated. "
            "Third, smart contract access control: strict authorization logic guarantees that only the original issuing organization can revoke a credential."
        ),
    },
    {
        "slide": 9,
        "title": "Technology Stack",
        "filename": "slide_09_tech_stack.mp3",
        "script": (
            "Our technology stack combines modern frontend tooling with Ethereum blockchain infrastructure. "
            "The frontend is built with React 18, Vite 5, JavaScript, and custom responsive CSS. "
            "The blockchain tier features a Solidity smart contract compiled to the EVM Paris target and tested on a local Hardhat network. "
            "Web3 integration is powered by Ethers.js version 6 for JSON-RPC provider and signer interactions, "
            "complemented by browser local storage for client-side caching."
        ),
    },
    {
        "slide": 10,
        "title": "Automated Testing & Validation",
        "filename": "slide_10_testing.mp3",
        "script": (
            "To guarantee contract reliability, we implemented a rigorous test suite using Hardhat, Mocha, and Chai. "
            "All ten automated tests pass with a one hundred percent success rate in under eight hundred milliseconds. "
            "The tests comprehensively validate certificate registration, duplicate ID rejection, valid hash matching, "
            "tampered hash rejection, non-existent ID handling, and authorized versus unauthorized revocation logic."
        ),
    },
    {
        "slide": 11,
        "title": "Demonstration Walkthrough",
        "filename": "slide_11_demo.mp3",
        "script": (
            "During a live demonstration, the workflow is straightforward. "
            "An issuer fills out the Add Certificate form and submits the transaction, receiving an instant on-chain transaction hash "
            "and unique Certificate ID. "
            "In the My Certificates tab, the credential displays an active status badge. "
            "On the Public Verification page, entering the ID verifies the credential with a bold VERIFIED badge. "
            "If even a single character is modified, the contract detects the mismatch and flags the credential as INVALID."
        ),
    },
    {
        "slide": 12,
        "title": "Thank You & Q&A",
        "filename": "slide_12_conclusion.mp3",
        "script": (
            "In conclusion, SkillChain proves that decentralized identity and cryptographic hashing can successfully eliminate "
            "credential fraud and streamline background checks. "
            "Thank you for your time, and I am now happy to answer any questions."
        ),
    },
]


async def generate_audio():
    output_dir = "audio_clips"
    os.makedirs(output_dir, exist_ok=True)

    print("Generating slide-by-slide audio voiceover clips...")
    full_script_parts = []

    for item in SLIDES:
        slide_num = item["slide"]
        filename = item["filename"]
        filepath = os.path.join(output_dir, filename)
        text = item["script"]
        full_script_parts.append(text)

        print(f"Generating Slide {slide_num:02d}: {item['title']} -> {filepath}")
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await communicate.save(filepath)

    # Now generate the continuous full presentation audio file
    full_audio_filename = "SkillChain_Full_Presentation_Voiceover.mp3"
    print(f"\nGenerating continuous full presentation voiceover -> {full_audio_filename}...")
    full_script_text = " ... ... ".join(full_script_parts)
    full_communicate = edge_tts.Communicate(full_script_text, VOICE, rate=RATE, pitch=PITCH)
    await full_communicate.save(full_audio_filename)

    print("\nAll audio voice notes generated successfully!")


if __name__ == "__main__":
    asyncio.run(generate_audio())
