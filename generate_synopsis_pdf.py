import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and display total page count."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            super().showPage()
        super().save()

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        # Footer text
        footer_text = "SkillChain — Blockchain-Based Skill Passport | Project Synopsis"
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawString(45, 28, footer_text)
        self.drawRightString(A4[0] - 45, 28, page_str)
        # Subtle footer divider
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.6)
        self.line(45, 40, A4[0] - 45, 40)
        self.restoreState()


def create_synopsis_pdf(output_filename="SkillChain_Project_Synopsis.pdf"):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        leftMargin=45,
        rightMargin=45,
        topMargin=45,
        bottomMargin=55,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=8,
    )

    meta_style = ParagraphStyle(
        "DocMeta",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#2563eb"),
    )

    h1_style = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12.5,
        leading=16,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "Body_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6,
        alignment=4,  # Justified
    )

    bullet_style = ParagraphStyle(
        "Bullet_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3,
    )

    callout_style = ParagraphStyle(
        "Callout_Text",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#334155"),
    )

    mono_style = ParagraphStyle(
        "MonoStyle",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0f172a"),
    )

    story = []

    # Title & Header
    story.append(Paragraph("SkillChain — Blockchain-Based Skill Passport", title_style))
    story.append(Paragraph("Decentralized Academic & Skill Credential Verification Project", subtitle_style))
    story.append(Paragraph("<b>DOMAIN:</b> Blockchain & Web3 Technologies &nbsp;&nbsp;|&nbsp;&nbsp; <b>NETWORK:</b> Ethereum (Solidity, Ethers.js, React)", meta_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=10))

    # 1. Introduction
    story.append(Paragraph("1. Introduction & Background", h1_style))
    story.append(Paragraph(
        "In the contemporary academic and professional sphere, verifiable credentials—including university degrees, diplomas, "
        "and technical course certificates—serve as vital proof of competence for recruitment and higher education. However, traditional "
        "paper certificates and standard digital PDFs are highly vulnerable to unauthorized alteration, duplication, and forgery using basic editing software. "
        "Centralized institutional verification systems frequently suffer from high administrative overhead, long response latencies, single points of failure, "
        "and security vulnerabilities.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>SkillChain</b> resolves these challenges by introducing an immutable, decentralized skill passport powered by Ethereum smart contracts "
        "and client-side cryptographic SHA-256 hashing. Certifying organizations anchor cryptographic proofs of issued credentials directly on the blockchain, "
        "enabling instantaneous, tamper-evident verification by recruiters, universities, and students without relying on intermediaries.",
        body_style,
    ))

    # 2. Problem Statement
    story.append(Paragraph("2. Problem Statement", h1_style))
    story.append(Paragraph("• <b>Credential Forgery:</b> Digital PDFs lack cryptographic integrity; modifying student names, skills, or grades requires minimal technical skill.", bullet_style))
    story.append(Paragraph("• <b>Centralized Vulnerability:</b> University databases are targets for cyberattacks, internal database tampering, and server outages.", bullet_style))
    story.append(Paragraph("• <b>Verification Latency:</b> Background verification currently relies on manual inquiries, taking days or weeks to authenticate credentials.", bullet_style))
    story.append(Paragraph("• <b>Unverifiable Revocation:</b> If a credential is cancelled due to academic malpractice, verifiers holding downloaded copies have no direct way to detect that the certificate has been invalidated.", bullet_style))

    # 3. Objectives
    story.append(Paragraph("3. Project Objectives", h1_style))
    story.append(Paragraph("1. Develop an Ethereum Solidity smart contract (<code>SkillChain.sol</code>) to store cryptographic certificate hashes permanently on-chain.", bullet_style))
    story.append(Paragraph("2. Implement deterministic client-side SHA-256 hashing to guarantee that any modification in metadata invalidates verification immediately.", bullet_style))
    story.append(Paragraph("3. Enforce unique certificate identifiers to eliminate duplicate or conflicting registrations on the blockchain ledger.", bullet_style))
    story.append(Paragraph("4. Implement decentralized access control restricting certificate revocation strictly to the authorized issuing authority.", bullet_style))
    story.append(Paragraph("5. Provide a responsive, beginner-friendly React.js frontend interface for issuing, viewing, and verifying certificates in real time.", bullet_style))
    story.append(Paragraph("6. Ensure reliability through a comprehensive automated unit test suite covering registration, verification, and revocation edge cases.", bullet_style))

    # 4. Architecture & Workflow
    story.append(Paragraph("4. System Architecture & Workflow", h1_style))
    story.append(Paragraph(
        "The architecture consists of three integrated layers: a client frontend (React + Vite), client-side cryptographic hashing, and a decentralized "
        "smart contract on an Ethereum local network (Hardhat).",
        body_style,
    ))

    # Workflow summary table
    workflow_data = [
        [Paragraph("Workflow Stage", table_header_style), Paragraph("Operational Mechanism", table_header_style)],
        [
            Paragraph("<b>1. Issuance</b>", table_cell_style),
            Paragraph("Issuer inputs student name, skill title, organization, and issue date. The app assigns a unique ID (<code>SKC-YYYY-XXXX</code>), computes the canonical SHA-256 hash, and broadcasts it to <code>SkillChain.sol</code>.", table_cell_style),
        ],
        [
            Paragraph("<b>2. Anchoring</b>", table_cell_style),
            Paragraph("The smart contract verifies the ID is unused, logs the transaction with an event, records the issuer address and timestamp, and stores the hash immutably.", table_cell_style),
        ],
        [
            Paragraph("<b>3. Verification</b>", table_cell_style),
            Paragraph("A verifier enters the Certificate ID. The application calculates the SHA-256 digest and queries the smart contract. The contract performs an on-chain comparison and returns <b>VERIFIED</b>, <b>INVALID</b>, or <b>REVOKED</b>.", table_cell_style),
        ],
    ]
    t_workflow = Table(workflow_data, colWidths=[1.4 * inch, 5.3 * inch])
    t_workflow.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(t_workflow)
    story.append(Spacer(1, 6))

    # 5. Key Modules
    story.append(Paragraph("5. Key Modules", h1_style))
    modules_data = [
        [Paragraph("Module", table_header_style), Paragraph("Functional Description", table_header_style)],
        [Paragraph("<b>Landing Page</b>", table_cell_style), Paragraph("Professional dashboard highlighting the project mission (<i>'Your Skills. Your Proof.'</i>) with direct access to issuance, viewing, and verification portals.", table_cell_style)],
        [Paragraph("<b>Add Certificate</b>", table_cell_style), Paragraph("Captures student and course details, validates inputs, computes SHA-256 digests, and executes Ethereum smart contract registration with transaction receipt feedback.", table_cell_style)],
        [Paragraph("<b>My Certificates</b>", table_cell_style), Paragraph("Displays all user-issued certificates stored in local browser storage, allowing live on-chain status checks and authorized revocation.", table_cell_style)],
        [Paragraph("<b>Verification Portal</b>", table_cell_style), Paragraph("Public verification page comparing candidate-provided details against immutable on-chain records with explicit status badges.", table_cell_style)],
        [Paragraph("<b>SkillChain Contract</b>", table_cell_style), Paragraph("Solidity smart contract maintaining an internal mapping of certificate records, enforcing duplicate rejection, and restricting revocation to the original issuer.", table_cell_style)],
    ]
    t_modules = Table(modules_data, colWidths=[1.6 * inch, 5.1 * inch])
    t_modules.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(t_modules)

    # 6. Technology Stack
    story.append(Paragraph("6. Technology Stack", h1_style))
    story.append(Paragraph("• <b>Frontend:</b> React.js 18, Vite 5, JavaScript (ES6+), Responsive Custom CSS3, Lucide React Icons", bullet_style))
    story.append(Paragraph("• <b>Smart Contract:</b> Solidity <code>^0.8.20</code>", bullet_style))
    story.append(Paragraph("• <b>Blockchain Environment:</b> Hardhat Local Blockchain Network (Chain ID: <code>31337</code>)", bullet_style))
    story.append(Paragraph("• <b>Web3 Integration:</b> Ethers.js (v6) for JSON-RPC provider and signer interactions", bullet_style))
    story.append(Paragraph("• <b>Client Storage:</b> Browser <code>localStorage</code> for offline credential persistence", bullet_style))
    story.append(Paragraph("• <b>Testing & Tooling:</b> Hardhat Test Runner, Mocha, Chai assertion library", bullet_style))

    # 7. Security & Cryptographic Mechanisms
    story.append(Paragraph("7. Security & Cryptographic Mechanisms", h1_style))
    callout_data = [[
        Paragraph(
            "<b>Data Privacy & Fingerprinting via SHA-256:</b> Sensitive personal details (student identity, grades) are hashed prior to registration. "
            "Because SHA-256 is a one-way mathematical function, no private student information is exposed on the public blockchain, "
            "yet any minor alteration in certificate attributes generates a completely different hash, instantly invalidating forged documents.",
            callout_style,
        )
    ]]
    t_callout = Table(callout_data, colWidths=[6.7 * inch])
    t_callout.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#bfdbfe")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t_callout)
    story.append(Spacer(1, 4))
    story.append(Paragraph("• <b>Immutability:</b> Once committed to an Ethereum block, certificate records cannot be edited, deleted, or backdated.", bullet_style))
    story.append(Paragraph("• <b>Issuer Access Control:</b> The <code>revokeCertificate</code> method enforces <code>require(cert.issuer == msg.sender)</code>, barring unauthorized addresses from revoking credentials.", bullet_style))
    story.append(Paragraph("• <b>Duplicate Collision Prevention:</b> The contract ensures <code>require(!certificates[_certificateId].exists)</code> to eliminate duplicate registrations.", bullet_style))

    # 8. Testing Results
    story.append(Paragraph("8. Automated Testing & Validation Results", h1_style))
    story.append(Paragraph(
        "A rigorous test suite containing <b>10 automated tests</b> was executed via Hardhat and Chai with a <b>100% pass rate</b>:",
        body_style,
    ))
    story.append(Paragraph("✔ Registering a certificate on-chain with unique ID and SHA-256 hash &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✔ Rejecting duplicate certificate IDs", bullet_style))
    story.append(Paragraph("✔ Rejecting registration with empty ID or hash &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✔ Verifying authentic certificate hashes", bullet_style))
    story.append(Paragraph("✔ Rejecting tampered / mismatched hashes &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✔ Handling non-existent certificate queries", bullet_style))
    story.append(Paragraph("✔ Authorizing revocation by the legitimate issuer &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✔ Rejecting revocation attempts by unauthorized accounts", bullet_style))
    story.append(Paragraph("✔ Rejecting verification of revoked certificates &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✔ Preventing duplicate revocation calls", bullet_style))

    # 9. Conclusion & Future Scope
    story.append(Paragraph("9. Conclusion & Future Scope", h1_style))
    story.append(Paragraph(
        "<b>Conclusion:</b> SkillChain demonstrates a practical, production-aligned implementation of decentralized identity and "
        "academic credentialing. By combining client-side cryptographic hashing with Ethereum smart contracts, the project eliminates "
        "certificate fraud and removes verification bottlenecks without storing sensitive student records on-chain.",
        body_style,
    ))
    story.append(Paragraph(
        "<b>Future Scope:</b> (1) Storing certificate visual assets on decentralized storage (IPFS); (2) Minting non-transferable Soulbound "
        "Tokens (ERC-5192) directly to student decentralized identity (DID) wallets; (3) Deploying to Layer-2 rollups (Arbitrum, Polygon) for sub-cent gas fees.",
        body_style,
    ))

    # Build document with custom canvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully created: {output_filename}")


if __name__ == "__main__":
    create_synopsis_pdf()
